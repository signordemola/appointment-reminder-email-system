import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";

import { createRawActionToken, hashActionToken } from "../../common/utils/action-tokens.js";
import { TRANSACTION_OPTIONS } from "../../common/utils/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AiProviderService } from "../../integrations/ai/ai-provider.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  buildRescheduleTriageContext,
  RESCHEDULE_REQUEST_TRIAGE_INCLUDE,
} from "../ai/reschedule-triage-context.js";
import { ReminderPlannerService } from "../reminders/reminder-planner.service.js";
import type { CreateRescheduleRequestInput } from "./dto/create-reschedule-request.dto.js";

type DatabaseClient = PrismaService | Prisma.TransactionClient;

type AppointmentTokenContext = {
  id: string;
  startsAtUtc: Date;
};

const APPOINTMENT_SUMMARY_INCLUDE = {
  contact: true,
} satisfies Prisma.AppointmentInclude;

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);
  private readonly publicWebUrl = (process.env.PUBLIC_WEB_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderPlanner: ReminderPlannerService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async issueTokensForAppointment(
    executor: DatabaseClient,
    appointment: AppointmentTokenContext,
    replaceExisting = true,
  ) {
    const now = new Date();
    const expiresAt = new Date(
      Math.min(appointment.startsAtUtc.getTime(), now.getTime() + 30 * 24 * 60 * 60 * 1000),
    );

    if (replaceExisting) {
      await executor.appointmentActionToken.updateMany({
        where: {
          appointmentId: appointment.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          expiresAt: now,
        },
      });
    }

    const confirmToken = createRawActionToken();
    const rescheduleToken = createRawActionToken();

    await executor.appointmentActionToken.create({
      data: {
        appointmentId: appointment.id,
        actionType: "confirm",
        tokenHash: hashActionToken(confirmToken),
        expiresAt,
      },
    });

    await executor.appointmentActionToken.create({
      data: {
        appointmentId: appointment.id,
        actionType: "reschedule",
        tokenHash: hashActionToken(rescheduleToken),
        expiresAt,
      },
    });

    return {
      expiresAt: expiresAt.toISOString(),
      confirm: {
        token: confirmToken,
        url: `${this.publicWebUrl}/confirm/${confirmToken}`,
      },
      reschedule: {
        token: rescheduleToken,
        url: `${this.publicWebUrl}/reschedule/${rescheduleToken}`,
      },
    };
  }

  async previewConfirmToken(rawToken: string) {
    const tokenRecord = await this.findUsableToken(this.prisma, rawToken, "confirm");

    return {
      actionType: "confirm",
      expiresAt: tokenRecord.expiresAt.toISOString(),
      appointment: this.toAppointmentPreview(tokenRecord.appointment),
    };
  }

  async previewRescheduleToken(rawToken: string) {
    const tokenRecord = await this.findUsableToken(this.prisma, rawToken, "reschedule");

    return {
      actionType: "reschedule",
      expiresAt: tokenRecord.expiresAt.toISOString(),
      appointment: this.toAppointmentPreview(tokenRecord.appointment),
    };
  }

  async confirmAppointment(rawToken: string) {
    return this.prisma.$transaction(async (transaction) => {
      const tokenRecord = await this.findUsableToken(transaction, rawToken, "confirm");
      const now = new Date();

      await transaction.appointmentActionToken.update({
        where: {
          id: tokenRecord.id,
        },
        data: {
          usedAt: now,
        },
      });

      const appointment = await transaction.appointment.update({
        where: {
          id: tokenRecord.appointmentId,
        },
        data: {
          status: "confirmed",
          confirmationStatus: "confirmed",
        },
      });

      await this.reminderPlanner.cancelPendingEvents(
        transaction,
        tokenRecord.appointmentId,
        "Appointment confirmed by the client.",
        ["confirmation_request"],
      );

      return {
        appointmentId: appointment.id,
        status: appointment.status,
        confirmationStatus: appointment.confirmationStatus,
        confirmedAt: now.toISOString(),
      };
    }, TRANSACTION_OPTIONS);
  }

  async createRescheduleRequest(rawToken: string, input: CreateRescheduleRequestInput) {
    const result = await this.prisma.$transaction(async (transaction) => {
      const tokenRecord = await this.findUsableToken(transaction, rawToken, "reschedule");
      const existingPendingRequest = await transaction.rescheduleRequest.findFirst({
        where: {
          appointmentId: tokenRecord.appointmentId,
          status: "pending",
        },
      });

      if (existingPendingRequest) {
        throw new ConflictException("A reschedule request is already pending review.");
      }

      const now = new Date();
      const request = await transaction.rescheduleRequest.create({
        data: {
          appointmentId: tokenRecord.appointmentId,
          preferredStartAtUtc: input.preferredStartAtUtc,
          preferredTimezone: input.preferredTimezone,
          message: input.message ?? null,
        },
      });

      await transaction.appointment.update({
        where: {
          id: tokenRecord.appointmentId,
        },
        data: {
          status: "reschedule_requested",
        },
      });

      await this.reminderPlanner.cancelPendingEvents(
        transaction,
        tokenRecord.appointmentId,
        "Client requested a reschedule.",
      );

      await transaction.appointmentActionToken.update({
        where: {
          id: tokenRecord.id,
        },
        data: {
          usedAt: now,
        },
      });

      return {
        appointmentId: tokenRecord.appointmentId,
        request,
      };
    }, TRANSACTION_OPTIONS);

    await this.generateAutomaticRescheduleTriage(result.request.id);

    return result;
  }

  private async generateAutomaticRescheduleTriage(rescheduleRequestId: string) {
    if (!this.aiProviderService.isConfigured()) {
      return;
    }

    try {
      const request = await this.prisma.rescheduleRequest.findUnique({
        where: {
          id: rescheduleRequestId,
        },
        include: RESCHEDULE_REQUEST_TRIAGE_INCLUDE,
      });

      if (!request) {
        return;
      }

      const result = await this.aiProviderService.triageRescheduleRequest(
        buildRescheduleTriageContext(request),
      );

      await this.prisma.rescheduleRequest.update({
        where: {
          id: request.id,
        },
        data: {
          aiTriageJson: result.triage as unknown as Prisma.InputJsonValue,
          aiTriageProvider: result.provider,
          aiTriageModel: result.model,
          aiTriageGeneratedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn({
        event: "actions.reschedule_request.ai_triage_skipped",
        rescheduleRequestId,
        message: error instanceof Error ? error.message : "Unknown AI triage error",
      });
    }
  }

  private async findUsableToken(
    executor: DatabaseClient,
    rawToken: string,
    actionType: "confirm" | "reschedule",
  ) {
    const normalizedToken = rawToken.trim();

    if (!normalizedToken) {
      throw new BadRequestException("Token is required.");
    }

    const tokenHash = hashActionToken(normalizedToken);
    const tokenRecord = await executor.appointmentActionToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        appointment: {
          include: APPOINTMENT_SUMMARY_INCLUDE,
        },
      },
    });

    if (!tokenRecord || tokenRecord.actionType !== actionType) {
      throw new NotFoundException("Action token not found.");
    }

    if (tokenRecord.usedAt) {
      throw new ConflictException("This action link has already been used.");
    }

    if (tokenRecord.expiresAt.getTime() <= Date.now()) {
      if (actionType === "confirm" && tokenRecord.appointment.confirmationStatus === "pending") {
        await executor.appointment.update({
          where: {
            id: tokenRecord.appointmentId,
          },
          data: {
            confirmationStatus: "expired",
          },
        });
      }

      throw new GoneException("This action link has expired.");
    }

    return tokenRecord;
  }

  private toAppointmentPreview(
    appointment: Prisma.AppointmentGetPayload<{
      include: typeof APPOINTMENT_SUMMARY_INCLUDE;
    }>,
  ) {
    return {
      id: appointment.id,
      title: appointment.title,
      startsAtUtc: appointment.startsAtUtc.toISOString(),
      endsAtUtc: appointment.endsAtUtc?.toISOString() ?? null,
      displayTimezone: appointment.displayTimezone,
      status: appointment.status,
      confirmationStatus: appointment.confirmationStatus,
      contact: {
        fullName: appointment.contact.fullName,
        email: appointment.contact.email,
        timezone: appointment.contact.timezone,
      },
    };
  }
}
