import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { TRANSACTION_OPTIONS } from "../../common/utils/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { parsePersistedRescheduleTriageSnapshot } from "../ai/reschedule-triage-context.js";
import { ActionsService } from "../actions/actions.service.js";
import { ReminderPlannerService } from "../reminders/reminder-planner.service.js";
import type { ReviewRescheduleRequestInput } from "./dto/review-reschedule-request.dto.js";

const RESCHEDULE_REQUEST_INCLUDE = {
  appointment: {
    include: {
      contact: true,
    },
  },
} satisfies Prisma.RescheduleRequestInclude;

@Injectable()
export class RescheduleRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderPlanner: ReminderPlannerService,
    private readonly actionsService: ActionsService,
  ) {}

  findAll(status?: string) {
    return this.prisma.rescheduleRequest.findMany({
      where: status ? { status: status as "pending" | "accepted" | "dismissed" } : {},
      include: RESCHEDULE_REQUEST_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    }).then((requests) =>
      requests.map((request) => {
        const persistedTriage = parsePersistedRescheduleTriageSnapshot({
          aiTriageJson: request.aiTriageJson,
          aiTriageProvider: request.aiTriageProvider,
          aiTriageModel: request.aiTriageModel,
          aiTriageGeneratedAt: request.aiTriageGeneratedAt,
        });

        return {
          ...request,
          aiTriage: persistedTriage
            ? {
                generatedAt: persistedTriage.generatedAt,
                rescheduleRequestId: request.id,
                appointmentId: request.appointmentId,
                provider: persistedTriage.provider,
                model: persistedTriage.model,
                triage: persistedTriage.triage,
              }
            : null,
        };
      }),
    );
  }

  async review(rescheduleRequestId: string, input: ReviewRescheduleRequestInput) {
    const request = await this.prisma.rescheduleRequest.findUnique({
      where: {
        id: rescheduleRequestId,
      },
      include: RESCHEDULE_REQUEST_INCLUDE,
    });

    if (!request) {
      throw new NotFoundException("Reschedule request not found.");
    }

    if (request.status !== "pending") {
      throw new ConflictException("This reschedule request has already been reviewed.");
    }

    return this.prisma.$transaction(async (transaction) => {
      const reviewedAt = new Date();

      if (input.decision === "dismiss") {
        const restoredStatus =
          request.appointment.confirmationStatus === "confirmed" ? "confirmed" : "scheduled";

        const updatedRequest = await transaction.rescheduleRequest.update({
          where: {
            id: rescheduleRequestId,
          },
          data: {
            status: "dismissed",
            reviewedAt,
            reviewedBy: input.reviewedBy,
          },
          include: RESCHEDULE_REQUEST_INCLUDE,
        });

        const restoredAppointment = await transaction.appointment.update({
          where: {
            id: request.appointmentId,
          },
          data: {
            status: restoredStatus,
          },
        });

        await this.reminderPlanner.refreshPlanForAppointment(
          transaction,
          restoredAppointment,
          request.appointment.contact,
          "Reminder plan restored after reschedule request dismissal.",
        );
        const actionLinks = await this.actionsService.issueTokensForAppointment(
          transaction,
          restoredAppointment,
        );

        return {
          request: updatedRequest,
          appointment: restoredAppointment,
          actionLinks,
        };
      }

      const nextStartAtUtc = input.preferredStartAtUtc ?? request.preferredStartAtUtc;
      const nextDisplayTimezone = input.preferredTimezone ?? request.preferredTimezone;
      const durationMs = request.appointment.endsAtUtc
        ? request.appointment.endsAtUtc.getTime() - request.appointment.startsAtUtc.getTime()
        : null;
      const nextEndsAtUtc =
        durationMs === null ? null : new Date(nextStartAtUtc.getTime() + durationMs);

      const updatedAppointment = await transaction.appointment.update({
        where: {
          id: request.appointmentId,
        },
        data: {
          startsAtUtc: nextStartAtUtc,
          endsAtUtc: nextEndsAtUtc,
          displayTimezone: nextDisplayTimezone,
          status: "scheduled",
          confirmationStatus: request.appointment.contact.emailOptOut ? "skipped" : "pending",
        },
      });

      const updatedRequest = await transaction.rescheduleRequest.update({
        where: {
          id: rescheduleRequestId,
        },
        data: {
          status: "accepted",
          reviewedAt,
          reviewedBy: input.reviewedBy,
        },
        include: RESCHEDULE_REQUEST_INCLUDE,
      });

      await this.reminderPlanner.refreshPlanForAppointment(
        transaction,
        updatedAppointment,
        request.appointment.contact,
      );
      const actionLinks = await this.actionsService.issueTokensForAppointment(
        transaction,
        updatedAppointment,
      );

      return {
        request: updatedRequest,
        appointment: updatedAppointment,
        actionLinks,
      };
    }, TRANSACTION_OPTIONS);
  }
}
