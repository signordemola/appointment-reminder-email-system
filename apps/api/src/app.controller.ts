import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: "appointment-reminder-api",
      status: "ok",
      docs: {
        appointments: "/appointments",
        importAppointments: "/appointments/import",
        reminderRules: "/reminder-rules",
        dashboard: "/dashboard/summary",
        dispatchDueReminders: "/internal/jobs/dispatch-due-reminders",
        resendWebhook: "/webhooks/resend",
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
