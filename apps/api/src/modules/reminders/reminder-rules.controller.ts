import { Controller, Get, Param, Patch, Body } from "@nestjs/common";

import { parseRequiredUuid } from "../../common/validation/request-parsers.js";
import { parseUpdateReminderRuleInput } from "./dto/update-reminder-rule.dto.js";
import { ReminderRulesService } from "./reminder-rules.service.js";

@Controller("reminder-rules")
export class ReminderRulesController {
  constructor(private readonly reminderRulesService: ReminderRulesService) {}

  @Get()
  findAll() {
    return this.reminderRulesService.findAll();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.reminderRulesService.update(
      parseRequiredUuid(id, "reminderRuleId"),
      parseUpdateReminderRuleInput(body),
    );
  }
}
