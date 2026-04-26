export const TRIAGE_URGENCIES = ["low", "medium", "high"] as const;
export const TRIAGE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export const TRIAGE_REASON_CATEGORIES = [
  "schedule_conflict",
  "transportation",
  "health_issue",
  "work_conflict",
  "family_conflict",
  "weather",
  "pricing_or_financial",
  "forgot",
  "needs_more_information",
  "other",
] as const;
export const TRIAGE_RECOMMENDED_ACTIONS = [
  "accept_requested_time",
  "offer_alternatives",
  "contact_client",
  "dismiss_request",
] as const;
export const TRIAGE_OPERATIONAL_RISK_LEVELS = ["none", "watch", "urgent"] as const;
export const REMINDER_COPY_TONES = [
  "professional",
  "warm",
  "reassuring",
  "concise",
] as const;
export const REMINDER_COPY_PLACEHOLDERS = [
  "{{client_name}}",
  "{{appointment_title}}",
  "{{appointment_start_local}}",
  "{{display_timezone}}",
  "{{location_name}}",
  "{{confirm_url}}",
  "{{reschedule_url}}",
] as const;

export type TriageUrgency = (typeof TRIAGE_URGENCIES)[number];
export type TriageConfidenceLevel = (typeof TRIAGE_CONFIDENCE_LEVELS)[number];
export type TriageReasonCategory = (typeof TRIAGE_REASON_CATEGORIES)[number];
export type TriageRecommendedAction = (typeof TRIAGE_RECOMMENDED_ACTIONS)[number];
export type TriageOperationalRiskLevel = (typeof TRIAGE_OPERATIONAL_RISK_LEVELS)[number];
export type ReminderCopyTone = (typeof REMINDER_COPY_TONES)[number];
export type ReminderCopyPlaceholder = (typeof REMINDER_COPY_PLACEHOLDERS)[number];

export interface RescheduleTriageContext {
  request: {
    id: string;
    status: "pending" | "accepted" | "dismissed";
    createdAt: string;
    preferredStartAtUtc: string;
    preferredTimezone: string;
    message?: string | null;
  };
  appointment: {
    id: string;
    title: string;
    locationName?: string | null;
    startsAtUtc: string;
    endsAtUtc?: string | null;
    displayTimezone: string;
    status: string;
    confirmationStatus: string;
    externalReference?: string | null;
    hoursUntilAppointment: number;
  };
  contact: {
    fullName: string;
    email: string;
    timezone: string;
    emailOptOut: boolean;
  };
}

export interface ReminderCopyContext {
  reminderRule: {
    id: string;
    name: string;
    eventType: "confirmation_request" | "reminder" | "follow_up";
    offsetMinutes: number;
    active: boolean;
  };
  businessName: string;
  businessType: string;
  senderName: string;
  tone: ReminderCopyTone;
  includeLocation: boolean;
  includeRescheduleOption: boolean;
  additionalInstructions?: string | null;
}

export interface RescheduleTriage {
  urgency: TriageUrgency;
  likelyReasonCategory: TriageReasonCategory;
  confidence: TriageConfidenceLevel;
  recommendedAction: TriageRecommendedAction;
  needsHumanFollowUp: boolean;
  operationalRisk: TriageOperationalRiskLevel;
  adminSummary: string;
  suggestedReply: string;
  riskFlags: string[];
}

export interface ReminderCopyDraft {
  subject: string;
  previewText: string;
  bodyText: string;
  rationale: string;
  placeholdersUsed: ReminderCopyPlaceholder[];
}

export interface RescheduleTriageProviderResult {
  provider: "gemini";
  model: string;
  triage: RescheduleTriage;
}

export interface ReminderCopyProviderResult {
  provider: "gemini";
  model: string;
  draft: ReminderCopyDraft;
}

export const RESCHEDULE_TRIAGE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    urgency: {
      type: "string",
      enum: [...TRIAGE_URGENCIES],
      description: "How urgent the front-desk team should treat this request.",
    },
    likelyReasonCategory: {
      type: "string",
      enum: [...TRIAGE_REASON_CATEGORIES],
      description: "The most likely reason category driving the reschedule request.",
    },
    confidence: {
      type: "string",
      enum: [...TRIAGE_CONFIDENCE_LEVELS],
      description: "The model's confidence in the classification.",
    },
    recommendedAction: {
      type: "string",
      enum: [...TRIAGE_RECOMMENDED_ACTIONS],
      description: "The best next operational step for the admin team.",
    },
    needsHumanFollowUp: {
      type: "boolean",
      description: "Whether the request should receive a human follow-up before a final decision.",
    },
    operationalRisk: {
      type: "string",
      enum: [...TRIAGE_OPERATIONAL_RISK_LEVELS],
      description: "Operational risk level if this request is handled poorly or left idle.",
    },
    adminSummary: {
      type: "string",
      description: "Short internal summary for the admin team.",
    },
    suggestedReply: {
      type: "string",
      description: "Short client-facing reply draft the team can adapt.",
    },
    riskFlags: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Short risk flag fragments, capped at three items.",
    },
  },
  required: [
    "urgency",
    "likelyReasonCategory",
    "confidence",
    "recommendedAction",
    "needsHumanFollowUp",
    "operationalRisk",
    "adminSummary",
    "suggestedReply",
    "riskFlags",
  ],
} as const;

export const REMINDER_COPY_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    subject: {
      type: "string",
      description:
        "Transactional email subject line, concise and operational rather than promotional.",
    },
    previewText: {
      type: "string",
      description: "Inbox preview text that complements the subject line.",
    },
    bodyText: {
      type: "string",
      description:
        "Plain-text body copy using only the approved placeholders where runtime appointment values are needed.",
    },
    rationale: {
      type: "string",
      description: "Short internal explanation for why the copy fits the rule and tone.",
    },
    placeholdersUsed: {
      type: "array",
      items: {
        type: "string",
        enum: [...REMINDER_COPY_PLACEHOLDERS],
      },
      description: "Approved runtime placeholders referenced in the generated copy.",
    },
  },
  required: ["subject", "previewText", "bodyText", "rationale", "placeholdersUsed"],
} as const;

function parseEnumValue<const TValue extends readonly string[]>(
  value: unknown,
  field: string,
  allowedValues: TValue,
): TValue[number] {
  if (typeof value !== "string") {
    throw new Error(`AI field "${field}" must be a string.`);
  }

  const normalizedValue = value.trim();
  if (!allowedValues.includes(normalizedValue)) {
    throw new Error(`AI field "${field}" must be one of: ${allowedValues.join(", ")}.`);
  }

  return normalizedValue as TValue[number];
}

function parseRequiredShortText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") {
    throw new Error(`AI field "${field}" must be a string.`);
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    throw new Error(`AI field "${field}" must not be empty.`);
  }

  return normalizedValue.length > maxLength
    ? normalizedValue.slice(0, maxLength).trim()
    : normalizedValue;
}

function parseRiskFlags(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('AI triage field "riskFlags" must be an array.');
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => (item.length > 80 ? item.slice(0, 80).trim() : item));
}

function parseReminderCopyPlaceholders(value: unknown): ReminderCopyPlaceholder[] {
  if (!Array.isArray(value)) {
    throw new Error('AI reminder copy field "placeholdersUsed" must be an array.');
  }

  const uniqueValues = new Set<ReminderCopyPlaceholder>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalizedValue = item.trim();
    if (REMINDER_COPY_PLACEHOLDERS.includes(normalizedValue as ReminderCopyPlaceholder)) {
      uniqueValues.add(normalizedValue as ReminderCopyPlaceholder);
    }
  }

  return [...uniqueValues];
}

export function parseRescheduleTriage(value: unknown): RescheduleTriage {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI triage response must be a JSON object.");
  }

  const payload = value as Record<string, unknown>;
  const needsHumanFollowUp = payload.needsHumanFollowUp;
  if (typeof needsHumanFollowUp !== "boolean") {
    throw new Error('AI triage field "needsHumanFollowUp" must be a boolean.');
  }

  return {
    urgency: parseEnumValue(payload.urgency, "urgency", TRIAGE_URGENCIES),
    likelyReasonCategory: parseEnumValue(
      payload.likelyReasonCategory,
      "likelyReasonCategory",
      TRIAGE_REASON_CATEGORIES,
    ),
    confidence: parseEnumValue(payload.confidence, "confidence", TRIAGE_CONFIDENCE_LEVELS),
    recommendedAction: parseEnumValue(
      payload.recommendedAction,
      "recommendedAction",
      TRIAGE_RECOMMENDED_ACTIONS,
    ),
    needsHumanFollowUp,
    operationalRisk: parseEnumValue(
      payload.operationalRisk,
      "operationalRisk",
      TRIAGE_OPERATIONAL_RISK_LEVELS,
    ),
    adminSummary: parseRequiredShortText(payload.adminSummary, "adminSummary", 240),
    suggestedReply: parseRequiredShortText(payload.suggestedReply, "suggestedReply", 320),
    riskFlags: parseRiskFlags(payload.riskFlags),
  };
}

export function parseReminderCopyDraft(value: unknown): ReminderCopyDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI reminder copy response must be a JSON object.");
  }

  const payload = value as Record<string, unknown>;

  return {
    subject: parseRequiredShortText(payload.subject, "subject", 90),
    previewText: parseRequiredShortText(payload.previewText, "previewText", 160),
    bodyText: parseRequiredShortText(payload.bodyText, "bodyText", 2000),
    rationale: parseRequiredShortText(payload.rationale, "rationale", 220),
    placeholdersUsed: parseReminderCopyPlaceholders(payload.placeholdersUsed),
  };
}
