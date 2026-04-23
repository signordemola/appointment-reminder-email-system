import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";

import { TRANSACTION_OPTIONS } from "../../common/utils/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  ReminderEventStatus,
  ReminderEventType,
} from "../../generated/prisma/client.js";
import { ResendService } from "../../integrations/resend/resend.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { ActionsService } from "../actions/actions.service.js";
import type { DispatchDueRemindersInput } from "./dto/dispatch-due-reminders.dto.js";

const DISPATCHABLE_REMINDER_EVENT_INCLUDE = {
  appointment: {
    include: {
      contact: true,
    },
  },
  rule: true,
} satisfies Prisma.ReminderEventInclude;

type DispatchableReminderEvent = Prisma.ReminderEventGetPayload<{
  include: typeof DISPATCHABLE_REMINDER_EVENT_INCLUDE;
}>;

type ActionLinks = Awaited<ReturnType<ActionsService["issueTokensForAppointment"]>>;

const ACTIVE_APPOINTMENT_STATUSES = new Set(["scheduled", "confirmed", "reschedule_requested"]);
const STALE_LOCK_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class InternalJobsService {
  private readonly logger = new Logger(InternalJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly actionsService: ActionsService,
    private readonly resendService: ResendService,
  ) {}

  async dispatchDueReminders(input: DispatchDueRemindersInput) {
    if (!this.resendService.isConfigured()) {
      throw new ServiceUnavailableException(
        "Resend is not fully configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL first.",
      );
    }

    const limit = Math.max(1, Math.min(input.limit, 100));
    const recoveredLocks = await this.releaseStaleLocks();
    const events = await this.claimDueReminderEvents(limit, input.appointmentId ?? undefined);

    if (events.length === 0) {
      return {
        recoveredLocks,
        claimedCount: 0,
        sentCount: 0,
        failedCount: 0,
        skippedCount: 0,
        canceledCount: 0,
        items: [],
      };
    }

    const actionLinksByAppointmentId = new Map<string, ActionLinks>();
    const items = [];
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let canceledCount = 0;

    for (const event of events) {
      const appointment = event.appointment;
      const contact = appointment.contact;

      if (!ACTIVE_APPOINTMENT_STATUSES.has(appointment.status)) {
        canceledCount += 1;
        items.push(await this.cancelEvent(event, `Appointment is ${appointment.status}.`));
        continue;
      }

      if (contact.emailOptOut) {
        skippedCount += 1;
        items.push(await this.skipEvent(event, "Contact opted out of email reminders."));
        continue;
      }

      try {
        const actionLinks =
          actionLinksByAppointmentId.get(appointment.id) ??
          (await this.actionsService.issueTokensForAppointment(this.prisma, appointment));
        actionLinksByAppointmentId.set(appointment.id, actionLinks);

        const sendResult = await this.resendService.sendAppointmentReminderEmail({
          to: contact.email,
          eventType: event.eventType,
          appointmentId: appointment.id,
          reminderEventId: event.id,
          appointmentTitle: appointment.title,
          startsAtUtc: appointment.startsAtUtc,
          displayTimezone: appointment.displayTimezone,
          locationName: appointment.locationName,
          contactName: contact.fullName,
          confirmUrl: actionLinks.confirm.url,
          rescheduleUrl: actionLinks.reschedule.url,
          idempotencyKey: event.id,
        });

        const updatedEvent = await this.prisma.reminderEvent.update({
          where: {
            id: event.id,
          },
          data: {
            status: "sent",
            provider: sendResult.provider,
            providerMessageId: sendResult.providerMessageId,
            processedAt: new Date(),
            errorMessage: null,
          },
        });

        sentCount += 1;
        items.push({
          reminderEventId: updatedEvent.id,
          appointmentId: appointment.id,
          status: updatedEvent.status,
          providerMessageId: updatedEvent.providerMessageId,
          eventType: updatedEvent.eventType,
        });
      } catch (error) {
        failedCount += 1;
        const message = error instanceof Error ? error.message : "Unknown dispatch error.";
        this.logger.error(
          JSON.stringify({
            event: "reminder.dispatch.failed",
            reminderEventId: event.id,
            appointmentId: appointment.id,
            message,
          }),
        );

        const updatedEvent = await this.prisma.reminderEvent.update({
          where: {
            id: event.id,
          },
          data: {
            status: "failed",
            processedAt: new Date(),
            errorMessage: message,
          },
        });

        items.push({
          reminderEventId: updatedEvent.id,
          appointmentId: appointment.id,
          status: updatedEvent.status,
          providerMessageId: updatedEvent.providerMessageId,
          eventType: updatedEvent.eventType,
          errorMessage: updatedEvent.errorMessage,
        });
      }
    }

    return {
      recoveredLocks,
      claimedCount: events.length,
      sentCount,
      failedCount,
      skippedCount,
      canceledCount,
      items,
    };
  }

  private async releaseStaleLocks() {
    const staleBefore = new Date(Date.now() - STALE_LOCK_WINDOW_MS);
    const result = await this.prisma.reminderEvent.updateMany({
      where: {
        status: "locked",
        lockedAt: {
          lt: staleBefore,
        },
      },
      data: {
        status: "pending",
        lockedAt: null,
        errorMessage: "Recovered stale dispatch lock.",
      },
    });

    return result.count;
  }

  private async claimDueReminderEvents(limit: number, appointmentId?: string) {
    const now = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const appointmentFilter = appointmentId
        ? Prisma.sql`AND "appointmentId" = CAST(${appointmentId} AS UUID)`
        : Prisma.empty;
      const claimedRows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        WITH due AS (
          SELECT id
          FROM "ReminderEvent"
          WHERE status = 'pending'::"ReminderEventStatus"
            AND "scheduledForUtc" <= ${now}
            ${appointmentFilter}
          ORDER BY "scheduledForUtc" ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "ReminderEvent" AS target
        SET status = 'locked'::"ReminderEventStatus",
            "lockedAt" = ${now},
            "updatedAt" = ${now}
        WHERE target.id IN (SELECT id FROM due)
        RETURNING target.id
      `);

      if (claimedRows.length === 0) {
        return [];
      }

      return transaction.reminderEvent.findMany({
        where: {
          id: {
            in: claimedRows.map((row) => row.id),
          },
        },
        include: DISPATCHABLE_REMINDER_EVENT_INCLUDE,
        orderBy: {
          scheduledForUtc: "asc",
        },
      });
    }, TRANSACTION_OPTIONS);
  }

  private async skipEvent(event: DispatchableReminderEvent, reason: string) {
    const updatedEvent = await this.prisma.reminderEvent.update({
      where: {
        id: event.id,
      },
      data: {
        status: "skipped",
        processedAt: new Date(),
        errorMessage: reason,
        lockedAt: null,
      },
    });

    return this.toResultItem(updatedEvent, event.appointmentId, updatedEvent.eventType, reason);
  }

  private async cancelEvent(event: DispatchableReminderEvent, reason: string) {
    const updatedEvent = await this.prisma.reminderEvent.update({
      where: {
        id: event.id,
      },
      data: {
        status: "canceled",
        processedAt: new Date(),
        errorMessage: reason,
        lockedAt: null,
      },
    });

    return this.toResultItem(updatedEvent, event.appointmentId, updatedEvent.eventType, reason);
  }

  private toResultItem(
    event: {
      id: string;
      status: ReminderEventStatus;
      providerMessageId: string | null;
    },
    appointmentId: string,
    eventType: ReminderEventType,
    errorMessage?: string | null,
  ) {
    return {
      reminderEventId: event.id,
      appointmentId,
      status: event.status,
      providerMessageId: event.providerMessageId,
      eventType,
      ...(errorMessage ? { errorMessage } : {}),
    };
  }
}
