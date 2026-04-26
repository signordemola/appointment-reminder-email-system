import { Body, Controller, Post } from "@nestjs/common";

import { parseCreateReminderCopyInput } from "./dto/create-reminder-copy.dto.js";
import { parseCreateRescheduleTriageInput } from "./dto/create-reschedule-triage.dto.js";
import { AiService } from "./ai.service.js";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("reschedule-triage")
  triageRescheduleRequest(@Body() body: unknown) {
    const input = parseCreateRescheduleTriageInput(body);
    return this.aiService.triageRescheduleRequest(input.rescheduleRequestId);
  }

  @Post("reminder-copy")
  generateReminderCopy(@Body() body: unknown) {
    return this.aiService.generateReminderCopy(parseCreateReminderCopyInput(body));
  }
}
