import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import type { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";

import { parseRequiredUuid } from "../../common/validation/request-parsers.js";
import { parseCreateAppointmentInput } from "./dto/create-appointment.dto.js";
import { parseListAppointmentsQuery } from "./dto/list-appointments.dto.js";
import { parseUpdateAppointmentInput } from "./dto/update-appointment.dto.js";
import { AppointmentsService } from "./appointments.service.js";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.appointmentsService.create(parseCreateAppointmentInput(body));
  }

  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2_000_000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.appointmentsService.importCsv(file);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.appointmentsService.findAll(parseListAppointmentsQuery(query));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.appointmentsService.findOne(parseRequiredUuid(id, "appointmentId"));
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.appointmentsService.update(
      parseRequiredUuid(id, "appointmentId"),
      parseUpdateAppointmentInput(body),
    );
  }
}
