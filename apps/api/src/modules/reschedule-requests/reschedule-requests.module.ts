import { Module } from "@nestjs/common";

import { ActionsModule } from "../actions/actions.module.js";
import { RemindersModule } from "../reminders/reminders.module.js";
import { RescheduleRequestsController } from "./reschedule-requests.controller.js";
import { RescheduleRequestsService } from "./reschedule-requests.service.js";

@Module({
  imports: [RemindersModule, ActionsModule],
  controllers: [RescheduleRequestsController],
  providers: [RescheduleRequestsService],
})
export class RescheduleRequestsModule {}
