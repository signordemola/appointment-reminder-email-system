import { Injectable, NotFoundException } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client.js";
import { AiProviderService } from "../../integrations/ai/ai-provider.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateReminderCopyInput } from "./dto/create-reminder-copy.dto.js";
import {
  buildRescheduleTriageContext,
  parsePersistedRescheduleTriageSnapshot,
  RESCHEDULE_REQUEST_TRIAGE_INCLUDE,
} from "./reschedule-triage-context.js";

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

    const result = await this.aiProviderService.triageRescheduleRequest(
      buildRescheduleTriageContext(request),
    );
    const generatedAt = new Date();

    const updatedRequest = await this.prisma.rescheduleRequest.update({
      where: {
        id: request.id,
      },
      data: {
        aiTriageJson: result.triage as unknown as Prisma.InputJsonValue,
        aiTriageProvider: result.provider,
        aiTriageModel: result.model,
        aiTriageGeneratedAt: generatedAt,
      },
    });
    const persistedTriage = parsePersistedRescheduleTriageSnapshot({
      aiTriageJson: updatedRequest.aiTriageJson,
      aiTriageProvider: updatedRequest.aiTriageProvider,
      aiTriageModel: updatedRequest.aiTriageModel,
      aiTriageGeneratedAt: updatedRequest.aiTriageGeneratedAt,
    });

    return {
      generatedAt: persistedTriage?.generatedAt ?? generatedAt.toISOString(),
      rescheduleRequestId: request.id,
      appointmentId: request.appointmentId,
      provider: result.provider,
      model: result.model,
      triage: persistedTriage?.triage ?? result.triage,
    };
  }

  async generateReminderCopy(input: CreateReminderCopyInput) {
    let ruleContext: {
      id: string;
      name: string;
      eventType: "confirmation_request" | "reminder" | "follow_up";
      offsetMinutes: number;
      active: boolean;
    };

    if (input.reminderRuleId) {
      const reminderRule = await this.prisma.reminderRule.findUnique({
        where: {
          id: input.reminderRuleId,
        },
      });

      if (!reminderRule) {
        throw new NotFoundException("Reminder rule not found.");
      }

      ruleContext = {
        id: reminderRule.id,
        name: reminderRule.name,
        eventType: reminderRule.eventType as "confirmation_request" | "reminder" | "follow_up",
        offsetMinutes: reminderRule.offsetMinutes,
        active: reminderRule.active,
      };
    } else {
      ruleContext = {
        id: "draft",
        name: input.ruleName ?? "New Reminder",
        eventType: (input.eventType ?? "reminder") as "reminder" | "confirmation_request" | "follow_up",
        offsetMinutes: input.offsetMinutes ?? -1440,
        active: false,
      };
    }

    const result = await this.aiProviderService.generateReminderCopy({
      reminderRule: ruleContext,
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
      reminderRule: ruleContext,
      provider: result.provider,
      model: result.model,
      draft: result.draft,
    };
  }
}
