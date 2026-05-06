import { Controller, Get, Param, Patch, Body, Query } from "@nestjs/common";

import { parseRequiredUuid } from "../../common/validation/request-parsers.js";
import { parseReviewRescheduleRequestInput } from "./dto/review-reschedule-request.dto.js";
import { RescheduleRequestsService } from "./reschedule-requests.service.js";

@Controller("reschedule-requests")
export class RescheduleRequestsController {
  constructor(private readonly rescheduleRequestsService: RescheduleRequestsService) {}

  @Get()
  findAll(@Query("status") status?: string) {
    return this.rescheduleRequestsService.findAll(status);
  }

  @Patch(":id")
  review(@Param("id") id: string, @Body() body: unknown) {
    return this.rescheduleRequestsService.review(
      parseRequiredUuid(id, "rescheduleRequestId"),
      parseReviewRescheduleRequestInput(body),
    );
  }
}
