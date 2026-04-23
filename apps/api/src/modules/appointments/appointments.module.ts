import { Module } from "@nestjs/common";

import { ActionsModule } from "../actions/actions.module.js";
import { ContactsModule } from "../contacts/contacts.module.js";
import { RemindersModule } from "../reminders/reminders.module.js";
import { AppointmentsController } from "./appointments.controller.js";
import { AppointmentsService } from "./appointments.service.js";

@Module({
  imports: [ContactsModule, RemindersModule, ActionsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
