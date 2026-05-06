import { BadRequestException } from "@nestjs/common";

import {
  asRecord,
  parseRequiredString,
  parseRequiredInteger,
} from "../../../common/validation/request-parsers.js";

const VALID_EVENT_TYPES = [
  "confirmation_request",
  "reminder",
  "follow_up",
] as const;
const VALID_CHANNELS = ["email"] as const;

export interface CreateReminderRuleInput {
  name: string;
  eventType: string;
  channel: string;
  offsetMinutes: number;
}

export function parseCreateReminderRuleInput(
  body: unknown,
): CreateReminderRuleInput {
  const payload = asRecord(body);
  const name = parseRequiredString(payload, "name", {
    minLength: 3,
    maxLength: 120,
  });
  const eventType = parseRequiredString(payload, "eventType", {
    maxLength: 50,
  });
  const channel = parseRequiredString(payload, "channel", { maxLength: 50 });
  const offsetMinutes = parseRequiredInteger(payload, "offsetMinutes");

  if (
    !VALID_EVENT_TYPES.includes(eventType as (typeof VALID_EVENT_TYPES)[number])
  ) {
    throw new BadRequestException(
      `eventType must be one of: ${VALID_EVENT_TYPES.join(", ")}.`,
    );
  }

  if (!VALID_CHANNELS.includes(channel as (typeof VALID_CHANNELS)[number])) {
    throw new BadRequestException(
      `channel must be one of: ${VALID_CHANNELS.join(", ")}.`,
    );
  }

  return { name, eventType, channel, offsetMinutes };
}
