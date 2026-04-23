import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

import {
  parseDispatchDueRemindersInput,
} from "./dto/dispatch-due-reminders.dto.js";
import { InternalJobsService } from "./internal-jobs.service.js";

@Controller("internal/jobs")
export class InternalJobsController {
  private readonly internalJobSecret = (process.env.INTERNAL_JOB_SECRET ?? "").trim();

  constructor(private readonly internalJobsService: InternalJobsService) {}

  @Post("dispatch-due-reminders")
  dispatchDueReminders(
    @Headers("x-job-secret") jobSecret: string | undefined,
    @Body() body: unknown,
  ) {
    if (this.internalJobSecret && jobSecret !== this.internalJobSecret) {
      throw new UnauthorizedException("Invalid internal job secret.");
    }

    return this.internalJobsService.dispatchDueReminders(parseDispatchDueRemindersInput(body));
  }
}
