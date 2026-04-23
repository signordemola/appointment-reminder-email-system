import { Module } from "@nestjs/common";

import { ResendModule } from "../../integrations/resend/resend.module.js";
import { ActionsModule } from "../actions/actions.module.js";
import { InternalJobsController } from "./internal-jobs.controller.js";
import { InternalJobsService } from "./internal-jobs.service.js";

@Module({
  imports: [ActionsModule, ResendModule],
  controllers: [InternalJobsController],
  providers: [InternalJobsService],
  exports: [InternalJobsService],
})
export class InternalJobsModule {}
