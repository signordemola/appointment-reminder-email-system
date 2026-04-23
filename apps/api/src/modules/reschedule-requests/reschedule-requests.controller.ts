import { Controller, Get, Param, Patch, Body } from "@nestjs/common";

import { parseRequiredUuid } from "../../common/validation/request-parsers.js";
import { parseReviewRescheduleRequestInput } from "./dto/review-reschedule-request.dto.js";
import { RescheduleRequestsService } from "./reschedule-requests.service.js";

@Controller("reschedule-requests")
export class RescheduleRequestsController {
  constructor(private readonly rescheduleRequestsService: RescheduleRequestsService) {}

  @Get()
  findAll() {
    return this.rescheduleRequestsService.findAll();
  }

  @Patch(":id")
  review(@Param("id") id: string, @Body() body: unknown) {
    return this.rescheduleRequestsService.review(
      parseRequiredUuid(id, "rescheduleRequestId"),
      parseReviewRescheduleRequestInput(body),
    );
  }
}
