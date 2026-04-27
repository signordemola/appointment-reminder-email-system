import { Module } from "@nestjs/common";

import { AiIntegrationModule } from "../../integrations/ai/ai-integration.module.js";
import { RemindersModule } from "../reminders/reminders.module.js";
import { ActionsController } from "./actions.controller.js";
import { ActionsService } from "./actions.service.js";

@Module({
  imports: [AiIntegrationModule, RemindersModule],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
