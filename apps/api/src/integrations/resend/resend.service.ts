import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Resend, type WebhookEventPayload } from "resend";

import type { ReminderEventType } from "../../generated/prisma/client.js";
import { buildAppointmentEmailContent } from "./email-content.js";

export type SendAppointmentReminderEmailInput = {
  to: string;
  eventType: ReminderEventType;
  appointmentId: string;
  reminderEventId: string;
  appointmentTitle: string;
  startsAtUtc: Date;
  displayTimezone: string;
  locationName?: string | null;
  contactName: string;
  confirmUrl: string;
  rescheduleUrl: string;
  idempotencyKey: string;
};

type WebhookHeaderInput = {
  id?: string;
  timestamp?: string;
  signature?: string;
};

@Injectable()
export class ResendService {
  private readonly apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  private readonly fromEmail = (process.env.RESEND_FROM_EMAIL ?? "").trim();
  private readonly replyTo = (process.env.RESEND_REPLY_TO ?? "").trim();
  private readonly webhookSecret = (process.env.RESEND_WEBHOOK_SECRET ?? "").trim();
  private readonly client = this.apiKey ? new Resend(this.apiKey) : null;

  isConfigured() {
    return this.client !== null && this.fromEmail.length > 0;
  }

  async sendAppointmentReminderEmail(input: SendAppointmentReminderEmailInput) {
    const client = this.requireClient();
    const content = buildAppointmentEmailContent({
      eventType: input.eventType,
      appointmentTitle: input.appointmentTitle,
      startsAtUtc: input.startsAtUtc,
      displayTimezone: input.displayTimezone,
      contactName: input.contactName,
      locationName: input.locationName,
      confirmUrl: input.confirmUrl,
      rescheduleUrl: input.rescheduleUrl,
    });

    const { data, error } = await client.emails.send(
      {
        from: this.fromEmail,
        to: input.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        ...(this.replyTo ? { reply_to: this.replyTo } : {}),
        tags: [
          { name: "appointment_id", value: input.appointmentId },
          { name: "reminder_event_id", value: input.reminderEventId },
          { name: "event_type", value: input.eventType },
        ],
      },
      {
        idempotencyKey: input.idempotencyKey,
      },
    );

    if (error || !data?.id) {
      throw new ServiceUnavailableException(
        error?.message ?? "Resend did not return a provider message id.",
      );
    }

    return {
      provider: "resend",
      providerMessageId: data.id,
    };
  }

  verifyWebhook(payload: string, headers: WebhookHeaderInput): WebhookEventPayload {
    const client = this.requireClient();

    if (!this.webhookSecret) {
      throw new ServiceUnavailableException("RESEND_WEBHOOK_SECRET is required to verify webhooks.");
    }

    if (!headers.id || !headers.timestamp || !headers.signature) {
      throw new BadRequestException("Missing Resend webhook signature headers.");
    }

    try {
      return client.webhooks.verify({
        payload,
        headers: {
          id: headers.id,
          timestamp: headers.timestamp,
          signature: headers.signature,
        },
        webhookSecret: this.webhookSecret,
      });
    } catch {
      throw new BadRequestException("Invalid Resend webhook signature.");
    }
  }

  private requireClient() {
    if (!this.client) {
      throw new ServiceUnavailableException("RESEND_API_KEY is not configured.");
    }

    if (!this.fromEmail) {
      throw new ServiceUnavailableException("RESEND_FROM_EMAIL is not configured.");
    }

    return this.client;
  }
}
