import { Controller, Get, Post, Delete, Param, Patch, Body, HttpCode, HttpStatus } from "@nestjs/common";

import { parseRequiredUuid } from "../../common/validation/request-parsers.js";
import { parseCreateReminderRuleInput } from "./dto/create-reminder-rule.dto.js";
import { parseUpdateReminderRuleInput } from "./dto/update-reminder-rule.dto.js";
import { ReminderRulesService } from "./reminder-rules.service.js";

@Controller("reminder-rules")
export class ReminderRulesController {
  constructor(private readonly reminderRulesService: ReminderRulesService) {}

  @Get()
  findAll() {
    return this.reminderRulesService.findAll();
  }

  @Post()
  create(@Body() body: unknown) {
    return this.reminderRulesService.create(parseCreateReminderRuleInput(body));
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.reminderRulesService.update(
      parseRequiredUuid(id, "reminderRuleId"),
      parseUpdateReminderRuleInput(body),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id") id: string) {
    return this.reminderRulesService.delete(
      parseRequiredUuid(id, "reminderRuleId"),
    );
  }
}
