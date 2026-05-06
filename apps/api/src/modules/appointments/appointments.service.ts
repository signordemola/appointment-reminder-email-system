import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { parse as parseCsv } from "csv-parse/sync";
import type { Express } from "express";

import { TRANSACTION_OPTIONS } from "../../common/utils/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { ActionsService } from "../actions/actions.service.js";
import { ContactsService } from "../contacts/contacts.service.js";
import { ReminderPlannerService } from "../reminders/reminder-planner.service.js";
import {
  parseCreateAppointmentInput,
  type CreateAppointmentInput,
} from "./dto/create-appointment.dto.js";
import type { ListAppointmentsQuery } from "./dto/list-appointments.dto.js";
import type { UpdateAppointmentInput } from "./dto/update-appointment.dto.js";

type DatabaseClient = PrismaService | Prisma.TransactionClient;
type CsvImportRow = Record<string, string | undefined>;

const APPOINTMENT_DETAIL_INCLUDE = {
  contact: true,
  reminderEvents: {
    include: {
      rule: true,
    },
    orderBy: {
      scheduledForUtc: "asc",
    },
  },
  rescheduleRequests: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.AppointmentInclude;

const REQUIRED_CSV_COLUMNS = [
  "customer_name",
  "customer_email",
  "appointment_title",
  "starts_at",
  "timezone",
] as const;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contactsService: ContactsService,
    private readonly reminderPlanner: ReminderPlannerService,
    private readonly actionsService: ActionsService,
  ) {}

  async create(input: CreateAppointmentInput) {
    return this.prisma.$transaction(
      (transaction) => this.createInTransaction(transaction, input),
      TRANSACTION_OPTIONS,
    );
  }

  async importCsv(file: Express.Multer.File) {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      throw new BadRequestException("The uploaded file must use a .csv filename.");
    }

    const records = parseCsv(file.buffer, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvImportRow[];

    if (records.length === 0) {
      throw new BadRequestException("The CSV file did not contain any data rows.");
    }

    const missingColumns = REQUIRED_CSV_COLUMNS.filter((column) => !(column in records[0]));
    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `The CSV file is missing required columns: ${missingColumns.join(", ")}.`,
      );
    }

    const imported = [];
    const errors = [];
    const warnings = [];

    for (const [index, row] of records.entries()) {
      const rowNumber = index + 2;

      try {
        const input = this.parseCsvImportRow(row, rowNumber);

        if (input.externalReference) {
          const duplicateReference = await this.prisma.appointment.findFirst({
            where: {
              externalReference: input.externalReference,
            },
            select: {
              id: true,
            },
          });

          if (duplicateReference) {
            warnings.push({
              row: rowNumber,
              message: `external_reference ${input.externalReference} already exists on appointment ${duplicateReference.id}.`,
            });
          }
        }

        const appointment = await this.create(input);
        imported.push({
          row: rowNumber,
          appointmentId: appointment.id,
          contactId: appointment.contactId,
          status: appointment.status,
          confirmationStatus: appointment.confirmationStatus,
          plannedEventCount: appointment.plannedEventCount,
        });
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unknown import error.",
        });
      }
    }

    return {
      totalRows: records.length,
      importedCount: imported.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      imported,
      errors,
      warnings,
    };
  }

  async findAll(query: ListAppointmentsQuery) {
    const where: Prisma.AppointmentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.confirmationStatus
        ? {
            confirmationStatus: query.confirmationStatus,
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                externalReference: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                contact: {
                  is: {
                    fullName: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                contact: {
                  is: {
                    email: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        include: {
          contact: true,
          reminderEvents: {
            select: {
              id: true,
              eventType: true,
              status: true,
              scheduledForUtc: true,
            },
          },
        },
        orderBy: [{ startsAtUtc: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      items,
    };
  }

  async findOne(appointmentId: string) {
    return this.getAppointmentDetail(this.prisma, appointmentId);
  }

  async update(appointmentId: string, input: UpdateAppointmentInput) {
    const currentAppointment = await this.getAppointmentDetail(this.prisma, appointmentId);
    const nextStartsAtUtc = input.startsAtUtc ?? currentAppointment.startsAtUtc;
    const nextEndsAtUtc =
      input.endsAtUtc === undefined ? currentAppointment.endsAtUtc : input.endsAtUtc;
    const nextDisplayTimezone = input.displayTimezone ?? currentAppointment.displayTimezone;
    const scheduleChanged =
      (input.startsAtUtc !== undefined &&
        input.startsAtUtc.getTime() !== currentAppointment.startsAtUtc.getTime()) ||
      (input.endsAtUtc !== undefined &&
        (input.endsAtUtc?.getTime() ?? null) !==
          (currentAppointment.endsAtUtc?.getTime() ?? null)) ||
      (input.displayTimezone !== undefined &&
        nextDisplayTimezone !== currentAppointment.displayTimezone);

    if (nextEndsAtUtc && nextEndsAtUtc.getTime() <= nextStartsAtUtc.getTime()) {
      throw new BadRequestException("endsAtUtc must be later than startsAtUtc.");
    }

    if (scheduleChanged && nextStartsAtUtc.getTime() <= Date.now()) {
      throw new BadRequestException("Updated startsAtUtc must be in the future.");
    }

    return this.prisma.$transaction(async (transaction) => {
      let nextStatus = input.status ?? currentAppointment.status;
      let nextConfirmationStatus =
        input.confirmationStatus ?? currentAppointment.confirmationStatus;

      if (scheduleChanged) {
        nextStatus = "scheduled";
        nextConfirmationStatus = currentAppointment.contact.emailOptOut ? "skipped" : "pending";
      }

      if (nextStatus === "confirmed") {
        nextConfirmationStatus = "confirmed";
      }

      if (nextConfirmationStatus === "confirmed") {
        nextStatus = "confirmed";
      }

      if (nextStatus === "canceled" && nextConfirmationStatus === "pending") {
        nextConfirmationStatus = "skipped";
      }

      const updatedAppointment = await transaction.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.locationName !== undefined ? { locationName: input.locationName } : {}),
          ...(input.startsAtUtc !== undefined ? { startsAtUtc: input.startsAtUtc } : {}),
          ...(input.endsAtUtc !== undefined ? { endsAtUtc: input.endsAtUtc } : {}),
          ...(input.displayTimezone !== undefined
            ? { displayTimezone: input.displayTimezone }
            : {}),
          ...(input.externalReference !== undefined
            ? { externalReference: input.externalReference }
            : {}),
          status: nextStatus,
          confirmationStatus: nextConfirmationStatus,
        },
      });

      let actionLinks: Awaited<
        ReturnType<ActionsService["issueTokensForAppointment"]>
      > | null = null;

      if (nextStatus === "canceled" || nextStatus === "completed" || nextStatus === "no_show") {
        await this.reminderPlanner.cancelPendingEvents(
          transaction,
          appointmentId,
          `Appointment marked as ${nextStatus}.`,
        );
      } else if (scheduleChanged) {
        await this.reminderPlanner.refreshPlanForAppointment(
          transaction,
          updatedAppointment,
          currentAppointment.contact,
        );
        actionLinks = await this.actionsService.issueTokensForAppointment(
          transaction,
          updatedAppointment,
        );
      }

      const detail = await this.getAppointmentDetail(transaction, appointmentId);

      return {
        ...detail,
        ...(actionLinks ? { actionLinks } : {}),
      };
    }, TRANSACTION_OPTIONS);
  }

  private async createInTransaction(executor: DatabaseClient, input: CreateAppointmentInput) {
    const contact = await this.contactsService.upsertAppointmentContact(executor, {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      contactTimezone: input.contactTimezone,
      emailOptOut: input.emailOptOut,
    });

    const appointment = await executor.appointment.create({
      data: {
        contactId: contact.id,
        title: input.title,
        locationName: input.locationName ?? null,
        startsAtUtc: input.startsAtUtc,
        endsAtUtc: input.endsAtUtc ?? null,
        displayTimezone: input.displayTimezone,
        externalReference: input.externalReference ?? null,
        confirmationStatus: contact.emailOptOut ? "skipped" : "pending",
      },
    });

    const plannedEvents = await this.reminderPlanner.refreshPlanForAppointment(
      executor,
      appointment,
      contact,
    );
    const actionLinks = await this.actionsService.issueTokensForAppointment(executor, appointment);
    const detail = await this.getAppointmentDetail(executor, appointment.id);

    return {
      ...detail,
      actionLinks,
      plannedEventCount: plannedEvents.length,
    };
  }

  private async getAppointmentDetail(executor: DatabaseClient, appointmentId: string) {
    const appointment = await executor.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: APPOINTMENT_DETAIL_INCLUDE,
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found.");
    }

    return appointment;
  }

  private parseCsvImportRow(row: CsvImportRow, rowNumber: number) {
    const timezone = this.requireCsvValue(row, "timezone", rowNumber);
    const contactTimezone = this.optionalCsvValue(row, "contact_timezone") ?? timezone;
    const displayTimezone = this.optionalCsvValue(row, "display_timezone") ?? timezone;
    const startsAtUtc = this.requireCsvValue(row, "starts_at", rowNumber);
    const endsAtUtc = this.optionalCsvValue(row, "ends_at");

    return parseCreateAppointmentInput({
      fullName: this.requireCsvValue(row, "customer_name", rowNumber),
      email: this.requireCsvValue(row, "customer_email", rowNumber),
      phone: this.optionalCsvValue(row, "phone") ?? undefined,
      contactTimezone,
      emailOptOut: this.parseCsvBoolean(row.email_opt_out, rowNumber),
      title: this.requireCsvValue(row, "appointment_title", rowNumber),
      locationName: this.optionalCsvValue(row, "location_name") ?? undefined,
      startsAtUtc,
      endsAtUtc: endsAtUtc ?? undefined,
      displayTimezone,
      externalReference: this.optionalCsvValue(row, "external_reference") ?? undefined,
    });
  }

  private requireCsvValue(row: CsvImportRow, key: string, rowNumber: number) {
    const value = row[key]?.trim();
    if (!value) {
      throw new BadRequestException(`Row ${rowNumber}: ${key} is required.`);
    }

    return value;
  }

  private optionalCsvValue(row: CsvImportRow, key: string) {
    const value = row[key]?.trim();
    return value ? value : null;
  }

  private parseCsvBoolean(value: string | undefined, rowNumber: number) {
    if (!value) {
      return false;
    }

    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }

    throw new BadRequestException(`Row ${rowNumber}: email_opt_out must be a boolean value.`);
  }
}
