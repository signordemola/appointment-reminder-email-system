import { Injectable } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client.js";
import type {
  Appointment,
  Contact,
  ReminderEventType,
  ReminderRule,
} from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";

type DatabaseClient = PrismaService | Prisma.TransactionClient;
type SchedulableAppointment = Pick<
  Appointment,
  "id" | "startsAtUtc" | "status" | "confirmationStatus"
>;
type SchedulableContact = Pick<Contact, "emailOptOut">;

@Injectable()
export class ReminderPlannerService {
  constructor(private readonly prisma: PrismaService) {}

  async refreshPlanForAppointment(
    executor: DatabaseClient,
    appointment: SchedulableAppointment,
    contact: SchedulableContact,
    cancellationReason = "Reminder plan regenerated.",
  ) {
    await this.cancelPendingEvents(executor, appointment.id, cancellationReason);

    const activeRules = await executor.reminderRule.findMany({
      where: {
        active: true,
      },
      orderBy: [{ eventType: "asc" }, { offsetMinutes: "asc" }],
    });

    const now = new Date();
    const createdEvents = [];

    for (const rule of activeRules) {
      const eventData = this.buildReminderEvent(rule, appointment, contact, now);
      if (!eventData) {
        continue;
      }

      createdEvents.push(
        await executor.reminderEvent.create({
          data: eventData,
        }),
      );
    }

    return createdEvents;
  }

  cancelPendingEvents(
    executor: DatabaseClient,
    appointmentId: string,
    reason: string,
    eventTypes?: ReminderEventType[],
  ) {
    return executor.reminderEvent.updateMany({
      where: {
        appointmentId,
        status: {
          in: ["pending", "locked"],
        },
        ...(eventTypes?.length
          ? {
              eventType: {
                in: eventTypes,
              },
            }
          : {}),
      },
      data: {
        status: "canceled",
        processedAt: new Date(),
        lockedAt: null,
        errorMessage: reason,
      },
    });
  }

  private buildReminderEvent(
    rule: ReminderRule,
    appointment: SchedulableAppointment,
    contact: SchedulableContact,
    now: Date,
  ): Prisma.ReminderEventUncheckedCreateInput | null {
    const scheduledForUtc = this.resolveScheduledFor(rule, appointment, now);

    if (!scheduledForUtc) {
      return null;
    }

    const shouldSkipForEmailOptOut = contact.emailOptOut;
    const scheduledTimeAlreadyPassed =
      rule.eventType !== "confirmation_request" && scheduledForUtc.getTime() <= now.getTime();

    return {
      appointmentId: appointment.id,
      ruleId: rule.id,
      channel: rule.channel,
      eventType: rule.eventType,
      scheduledForUtc,
      status:
        shouldSkipForEmailOptOut || scheduledTimeAlreadyPassed
          ? "skipped"
          : "pending",
      processedAt:
        shouldSkipForEmailOptOut || scheduledTimeAlreadyPassed ? now : undefined,
      errorMessage: shouldSkipForEmailOptOut
        ? "Contact opted out of email reminders."
        : scheduledTimeAlreadyPassed
          ? "The scheduled send time had already passed when the plan was generated."
          : undefined,
    };
  }

  private resolveScheduledFor(
    rule: ReminderRule,
    appointment: SchedulableAppointment,
    now: Date,
  ) {
    if (rule.eventType === "confirmation_request") {
      if (appointment.confirmationStatus !== "pending") {
        return null;
      }

      return now;
    }

    return new Date(appointment.startsAtUtc.getTime() + rule.offsetMinutes * 60_000);
  }
}
