import { Module } from "@nestjs/common";

import { ResendModule } from "../../integrations/resend/resend.module.js";
import { ResendWebhooksController } from "./resend-webhooks.controller.js";
import { ResendWebhooksService } from "./resend-webhooks.service.js";

@Module({
  imports: [ResendModule],
  controllers: [ResendWebhooksController],
  providers: [ResendWebhooksService],
})
export class ResendWebhooksModule {}
