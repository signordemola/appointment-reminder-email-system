import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateReminderRuleInput } from "./dto/create-reminder-rule.dto.js";
import type { UpdateReminderRuleInput } from "./dto/update-reminder-rule.dto.js";

@Injectable()
export class ReminderRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rules = await this.prisma.reminderRule.findMany({
      orderBy: [{ eventType: "asc" }, { offsetMinutes: "asc" }],
      include: {
        _count: {
          select: {
            reminderEvents: {
              where: {
                status: { in: ["sent", "delivered", "opened", "clicked"] },
              },
            },
          },
        },
      },
    });

    return rules.map((rule) => ({
      ...rule,
      sentCount: rule._count.reminderEvents,
      _count: undefined,
    }));
  }

  create(input: CreateReminderRuleInput) {
    return this.prisma.reminderRule.create({
      data: {
        name: input.name,
        eventType: input.eventType as "confirmation_request" | "reminder" | "follow_up",
        channel: input.channel as "email",
        offsetMinutes: input.offsetMinutes,
      },
    });
  }

  async update(reminderRuleId: string, input: UpdateReminderRuleInput) {
    const existingRule = await this.prisma.reminderRule.findUnique({
      where: {
        id: reminderRuleId,
      },
    });

    if (!existingRule) {
      throw new NotFoundException("Reminder rule not found.");
    }

    return this.prisma.reminderRule.update({
      where: {
        id: reminderRuleId,
      },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.offsetMinutes !== undefined ? { offsetMinutes: input.offsetMinutes } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  }

  async delete(reminderRuleId: string) {
    const existingRule = await this.prisma.reminderRule.findUnique({
      where: {
        id: reminderRuleId,
      },
    });

    if (!existingRule) {
      throw new NotFoundException("Reminder rule not found.");
    }

    await this.prisma.reminderRule.delete({
      where: {
        id: reminderRuleId,
      },
    });
  }
}
