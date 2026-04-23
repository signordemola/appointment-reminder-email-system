import { Module } from "@nestjs/common";

import { ResendService } from "./resend.service.js";

@Module({
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
