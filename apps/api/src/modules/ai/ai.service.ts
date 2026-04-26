import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client.js";
import { AiProviderService } from "../../integrations/ai/ai-provider.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateReminderCopyInput } from "./dto/create-reminder-copy.dto.js";

const RESCHEDULE_REQUEST_TRIAGE_INCLUDE = {
  appointment: {
    include: {
      contact: true,
    },
  },
} satisfies Prisma.RescheduleRequestInclude;

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async triageRescheduleRequest(rescheduleRequestId: string) {
    const request = await this.prisma.rescheduleRequest.findUnique({
      where: {
        id: rescheduleRequestId,
      },
      include: RESCHEDULE_REQUEST_TRIAGE_INCLUDE,
    });

    if (!request) {
      throw new NotFoundException("Reschedule request not found.");
    }

    const now = Date.now();
    const hoursUntilAppointment = Number(
      ((request.appointment.startsAtUtc.getTime() - now) / (60 * 60 * 1000)).toFixed(1),
    );

    const result = await this.aiProviderService.triageRescheduleRequest({
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        preferredStartAtUtc: request.preferredStartAtUtc.toISOString(),
        preferredTimezone: request.preferredTimezone,
        ...(request.message ? { message: request.message } : {}),
      },
      appointment: {
        id: request.appointment.id,
        title: request.appointment.title,
        startsAtUtc: request.appointment.startsAtUtc.toISOString(),
        displayTimezone: request.appointment.displayTimezone,
        status: request.appointment.status,
        confirmationStatus: request.appointment.confirmationStatus,
        hoursUntilAppointment,
        ...(request.appointment.locationName ? { locationName: request.appointment.locationName } : {}),
        ...(request.appointment.endsAtUtc
          ? { endsAtUtc: request.appointment.endsAtUtc.toISOString() }
          : {}),
        ...(request.appointment.externalReference
          ? { externalReference: request.appointment.externalReference }
          : {}),
      },
      contact: {
        fullName: request.appointment.contact.fullName,
        email: request.appointment.contact.email,
        timezone: request.appointment.contact.timezone,
        emailOptOut: request.appointment.contact.emailOptOut,
      },
    });

    return {
      generatedAt: new Date().toISOString(),
      rescheduleRequestId: request.id,
      appointmentId: request.appointmentId,
      provider: result.provider,
      model: result.model,
      triage: result.triage,
    };
  }

  async generateReminderCopy(input: CreateReminderCopyInput) {
    const reminderRule = await this.prisma.reminderRule.findUnique({
      where: {
        id: input.reminderRuleId,
      },
    });

    if (!reminderRule) {
      throw new NotFoundException("Reminder rule not found.");
    }

    const result = await this.aiProviderService.generateReminderCopy({
      reminderRule: {
        id: reminderRule.id,
        name: reminderRule.name,
        eventType: reminderRule.eventType,
        offsetMinutes: reminderRule.offsetMinutes,
        active: reminderRule.active,
      },
      businessName: input.businessName,
      businessType: input.businessType,
      senderName: input.senderName,
      tone: input.tone,
      includeLocation: input.includeLocation,
      includeRescheduleOption: input.includeRescheduleOption,
      ...(input.additionalInstructions ? { additionalInstructions: input.additionalInstructions } : {}),
    });

    return {
      generatedAt: new Date().toISOString(),
      reminderRule: {
        id: reminderRule.id,
        name: reminderRule.name,
        eventType: reminderRule.eventType,
        offsetMinutes: reminderRule.offsetMinutes,
        active: reminderRule.active,
      },
      provider: result.provider,
      model: result.model,
      draft: result.draft,
    };
  }
}
