import { BadRequestException, Injectable } from "@nestjs/common";
import type { WebhookEventPayload } from "resend";

import type { Prisma, ReminderEventStatus } from "../../generated/prisma/client.js";
import { ResendService } from "../../integrations/resend/resend.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

type WebhookHeaders = {
  id?: string;
  timestamp?: string;
  signature?: string;
};

const STATUS_RANK: Record<ReminderEventStatus, number> = {
  pending: 0,
  locked: 1,
  sent: 2,
  delivered: 3,
  opened: 4,
  clicked: 5,
  bounced: 6,
  failed: 6,
  canceled: 7,
  skipped: 7,
};

@Injectable()
export class ResendWebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resendService: ResendService,
  ) {}

  async handleWebhook(rawPayload: string, headers: WebhookHeaders) {
    if (!rawPayload) {
      throw new BadRequestException("Webhook payload is required.");
    }

    const webhookEvent = this.resendService.verifyWebhook(rawPayload, headers);
    const providerEventId = headers.id;
    const providerMessageId = this.getProviderMessageId(webhookEvent);

    if (providerEventId) {
      const existingRecord = await this.prisma.emailWebhookEvent.findFirst({
        where: {
          providerEventId,
        },
      });

      if (existingRecord) {
        return {
          received: true,
          duplicate: true,
          providerEventId,
          providerMessageId,
        };
      }
    }

    const storedWebhookEvent = await this.prisma.emailWebhookEvent.create({
      data: {
        provider: "resend",
        providerEventId: providerEventId ?? null,
        providerMessageId,
        eventType: webhookEvent.type,
        payloadJson: JSON.parse(rawPayload) as Prisma.InputJsonValue,
      },
    });

    const nextStatus = this.mapWebhookEventToStatus(webhookEvent);
    const nextErrorMessage = this.mapWebhookEventToErrorMessage(webhookEvent);
    const reminderEvent = await this.prisma.reminderEvent.findFirst({
      where: {
        provider: "resend",
        providerMessageId,
      },
    });

    if (!reminderEvent) {
      return {
        received: true,
        duplicate: false,
        storedWebhookEventId: storedWebhookEvent.id,
        providerMessageId,
        matchedReminderEvent: false,
      };
    }

    if (nextStatus) {
      const shouldAdvance = STATUS_RANK[nextStatus] >= STATUS_RANK[reminderEvent.status];

      if (shouldAdvance) {
        await this.prisma.reminderEvent.update({
          where: {
            id: reminderEvent.id,
          },
          data: {
            status: nextStatus,
            processedAt: new Date(webhookEvent.created_at),
            errorMessage: nextErrorMessage ?? null,
          },
        });
      } else if (nextErrorMessage) {
        await this.prisma.reminderEvent.update({
          where: {
            id: reminderEvent.id,
          },
          data: {
            errorMessage: nextErrorMessage,
          },
        });
      }
    } else if (nextErrorMessage) {
      await this.prisma.reminderEvent.update({
        where: {
          id: reminderEvent.id,
        },
        data: {
          errorMessage: nextErrorMessage,
        },
      });
    }

    return {
      received: true,
      duplicate: false,
      storedWebhookEventId: storedWebhookEvent.id,
      providerMessageId,
      matchedReminderEvent: true,
      reminderEventId: reminderEvent.id,
      ...(nextStatus ? { appliedStatus: nextStatus } : {}),
    };
  }

  private getProviderMessageId(webhookEvent: WebhookEventPayload) {
    if (!("data" in webhookEvent) || !("email_id" in webhookEvent.data)) {
      throw new BadRequestException("Unsupported Resend webhook payload.");
    }

    return webhookEvent.data.email_id;
  }

  private mapWebhookEventToStatus(webhookEvent: WebhookEventPayload): ReminderEventStatus | null {
    switch (webhookEvent.type) {
      case "email.sent":
      case "email.scheduled":
        return "sent";
      case "email.delivered":
        return "delivered";
      case "email.opened":
        return "opened";
      case "email.clicked":
        return "clicked";
      case "email.bounced":
        return "bounced";
      case "email.failed":
      case "email.complained":
      case "email.suppressed":
        return "failed";
      case "email.delivery_delayed":
      case "email.received":
        return null;
      default:
        return null;
    }
  }

  private mapWebhookEventToErrorMessage(webhookEvent: WebhookEventPayload) {
    switch (webhookEvent.type) {
      case "email.bounced":
        return webhookEvent.data.bounce.message;
      case "email.failed":
        return webhookEvent.data.failed.reason;
      case "email.suppressed":
        return webhookEvent.data.suppressed.message;
      case "email.delivery_delayed":
        return "Resend reported delayed email delivery.";
      case "email.complained":
        return "Recipient complained about the email.";
      default:
        return null;
    }
  }
}
