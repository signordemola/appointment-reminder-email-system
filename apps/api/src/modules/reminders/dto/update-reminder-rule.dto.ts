import { BadRequestException } from "@nestjs/common";

import {
  asRecord,
  parseOptionalBoolean,
  parseOptionalInteger,
  parseOptionalString,
} from "../../../common/validation/request-parsers.js";

export interface UpdateReminderRuleInput {
  name?: string;
  offsetMinutes?: number;
  active?: boolean;
}

export function parseUpdateReminderRuleInput(body: unknown): UpdateReminderRuleInput {
  const payload = asRecord(body);
  const name = parseOptionalString(payload, "name", {
    minLength: 3,
    maxLength: 120,
  });
  const offsetMinutes = parseOptionalInteger(payload, "offsetMinutes");
  const active = parseOptionalBoolean(payload, "active");

  if (name === null) {
    throw new BadRequestException("name cannot be null.");
  }

  if (offsetMinutes === undefined && active === undefined && name === undefined) {
    throw new BadRequestException("At least one reminder rule field must be provided.");
  }

  return {
    ...(name !== undefined ? { name } : {}),
    ...(offsetMinutes !== undefined ? { offsetMinutes } : {}),
    ...(active !== undefined ? { active } : {}),
  };
}
