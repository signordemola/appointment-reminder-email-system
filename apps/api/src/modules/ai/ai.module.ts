import { Module } from "@nestjs/common";

import { AiIntegrationModule } from "../../integrations/ai/ai-integration.module.js";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";

@Module({
  imports: [AiIntegrationModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
