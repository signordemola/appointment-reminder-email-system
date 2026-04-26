import { Module } from "@nestjs/common";

import { AiProviderService } from "./ai-provider.service.js";
import { GeminiAiService } from "./gemini-ai.service.js";

@Module({
  providers: [AiProviderService, GeminiAiService],
  exports: [AiProviderService],
})
export class AiIntegrationModule {}
