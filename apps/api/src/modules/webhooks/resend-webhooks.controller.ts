import { Controller, Headers, Post, Req } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";

import { ResendWebhooksService } from "./resend-webhooks.service.js";

@Controller("webhooks/resend")
export class ResendWebhooksController {
  constructor(private readonly resendWebhooksService: ResendWebhooksService) {}

  @Post()
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("svix-id") svixId: string | undefined,
    @Headers("svix-timestamp") svixTimestamp: string | undefined,
    @Headers("svix-signature") svixSignature: string | undefined,
  ) {
    const rawPayload = request.rawBody?.toString("utf8") ?? "";

    return this.resendWebhooksService.handleWebhook(rawPayload, {
      id: svixId,
      timestamp: svixTimestamp,
      signature: svixSignature,
    });
  }
}
