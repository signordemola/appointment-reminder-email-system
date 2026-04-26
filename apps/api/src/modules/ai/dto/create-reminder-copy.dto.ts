import {
  asRecord,
  parseOptionalBoolean,
  parseRequiredEnum,
  parseOptionalString,
  parseRequiredString,
  parseRequiredUuid,
} from "../../../common/validation/request-parsers.js";
import { REMINDER_COPY_TONES, type ReminderCopyTone } from "../../../integrations/ai/ai.types.js";

export interface CreateReminderCopyInput {
  reminderRuleId: string;
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
    reminderRuleId: parseRequiredUuid(payload.reminderRuleId, "reminderRuleId"),
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
