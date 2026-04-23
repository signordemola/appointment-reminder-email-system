import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { ActionsModule } from "./modules/actions/actions.module.js";
import { AppointmentsModule } from "./modules/appointments/appointments.module.js";
import { ContactsModule } from "./modules/contacts/contacts.module.js";
import { DashboardModule } from "./modules/dashboard/dashboard.module.js";
import { InternalJobsModule } from "./modules/internal-jobs/internal-jobs.module.js";
import { RemindersModule } from "./modules/reminders/reminders.module.js";
import { RescheduleRequestsModule } from "./modules/reschedule-requests/reschedule-requests.module.js";
import { ResendWebhooksModule } from "./modules/webhooks/resend-webhooks.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [
    PrismaModule,
    ContactsModule,
    RemindersModule,
    ActionsModule,
    AppointmentsModule,
    RescheduleRequestsModule,
    DashboardModule,
    InternalJobsModule,
    ResendWebhooksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
