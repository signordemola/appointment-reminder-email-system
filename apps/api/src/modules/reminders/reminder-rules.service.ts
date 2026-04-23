import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";
import type { UpdateReminderRuleInput } from "./dto/update-reminder-rule.dto.js";

@Injectable()
export class ReminderRulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.reminderRule.findMany({
      orderBy: [{ eventType: "asc" }, { offsetMinutes: "asc" }],
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
}
