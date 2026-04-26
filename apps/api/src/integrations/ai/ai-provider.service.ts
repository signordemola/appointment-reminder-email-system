import { Injectable } from "@nestjs/common";

import type { ReminderCopyContext, RescheduleTriageContext } from "./ai.types.js";
import { GeminiAiService } from "./gemini-ai.service.js";

@Injectable()
export class AiProviderService {
  constructor(private readonly geminiAiService: GeminiAiService) {}

  isConfigured() {
    return this.geminiAiService.isConfigured();
  }

  triageRescheduleRequest(context: RescheduleTriageContext) {
    return this.geminiAiService.triageRescheduleRequest(context);
  }

  generateReminderCopy(context: ReminderCopyContext) {
    return this.geminiAiService.generateReminderCopy(context);
  }
}
