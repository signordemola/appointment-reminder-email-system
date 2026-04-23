import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { parseCreateRescheduleRequestInput } from "./dto/create-reschedule-request.dto.js";
import { ActionsService } from "./actions.service.js";

@Controller("actions")
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get("confirm/:token")
  previewConfirm(@Param("token") token: string) {
    return this.actionsService.previewConfirmToken(token);
  }

  @Post("confirm/:token")
  confirm(@Param("token") token: string) {
    return this.actionsService.confirmAppointment(token);
  }

  @Get("reschedule/:token")
  previewReschedule(@Param("token") token: string) {
    return this.actionsService.previewRescheduleToken(token);
  }

  @Post("reschedule/:token")
  createRescheduleRequest(@Param("token") token: string, @Body() body: unknown) {
    return this.actionsService.createRescheduleRequest(
      token,
      parseCreateRescheduleRequestInput(body),
    );
  }
}
