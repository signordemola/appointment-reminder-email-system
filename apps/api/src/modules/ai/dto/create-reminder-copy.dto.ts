import {
  asRecord,
  parseOptionalBoolean,
  parseRequiredEnum,
  parseOptionalString,
  parseRequiredString,
  parseOptionalUuid,
  parseOptionalEnum,
  parseOptionalInteger,
} from "../../../common/validation/request-parsers.js";
import { REMINDER_COPY_TONES, type ReminderCopyTone } from "../../../integrations/ai/ai.types.js";

const EVENT_TYPES = ["reminder", "confirmation_request", "follow_up"] as const;
type EventType = (typeof EVENT_TYPES)[number];

export interface CreateReminderCopyInput {
  reminderRuleId?: string | null;
  ruleName?: string | null;
  eventType?: EventType | null;
  offsetMinutes?: number | null;
  businessName: string;
  businessType: string;
  senderName: string;
  tone: ReminderCopyTone;
  includeLocation: boolean;
  includeRescheduleOption: boolean;
  additionalInstructions?: string | null;
}

export function parseCreateReminderCopyInput(body: unknown): CreateReminderCopyInput {
  const payload = asRecord(body);

  return {
    reminderRuleId: parseOptionalUuid(payload, "reminderRuleId") ?? null,
    ruleName: parseOptionalString(payload, "ruleName", { maxLength: 120 }) ?? null,
    eventType: (parseOptionalEnum(payload, "eventType", EVENT_TYPES) as EventType | null) ?? null,
    offsetMinutes: parseOptionalInteger(payload, "offsetMinutes") ?? null,
    businessName: parseRequiredString(payload, "businessName", {
      minLength: 2,
      maxLength: 120,
    }),
    businessType: parseRequiredString(payload, "businessType", {
      minLength: 2,
      maxLength: 160,
    }),
    senderName: parseRequiredString(payload, "senderName", {
      minLength: 2,
      maxLength: 120,
    }),
    tone: parseRequiredEnum(payload, "tone", REMINDER_COPY_TONES) as ReminderCopyTone,
    includeLocation: parseOptionalBoolean(payload, "includeLocation") ?? true,
    includeRescheduleOption: parseOptionalBoolean(payload, "includeRescheduleOption") ?? true,
    additionalInstructions: parseOptionalString(payload, "additionalInstructions", {
      maxLength: 500,
    }),
  };
}
