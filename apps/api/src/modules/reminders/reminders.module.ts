import { Module } from "@nestjs/common";

import { ReminderPlannerService } from "./reminder-planner.service.js";
import { ReminderRulesController } from "./reminder-rules.controller.js";
import { ReminderRulesService } from "./reminder-rules.service.js";

@Module({
  controllers: [ReminderRulesController],
  providers: [ReminderPlannerService, ReminderRulesService],
  exports: [ReminderPlannerService, ReminderRulesService],
})
export class RemindersModule {}
