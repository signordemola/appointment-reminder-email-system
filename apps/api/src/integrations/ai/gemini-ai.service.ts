import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ApiError, GoogleGenAI } from "@google/genai";

import {
  parseReminderCopyDraft,
  parseRescheduleTriage,
  REMINDER_COPY_JSON_SCHEMA,
  REMINDER_COPY_PLACEHOLDERS,
  RESCHEDULE_TRIAGE_JSON_SCHEMA,
  type ReminderCopyContext,
  type ReminderCopyDraft,
  type ReminderCopyProviderResult,
  type RescheduleTriage,
  type RescheduleTriageContext,
  type RescheduleTriageProviderResult,
} from "./ai.types.js";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const FAILOVER_STATUS_CODES = new Set([401, 403, 408, 429, 500, 502, 503, 504]);

type GeminiClientEntry = {
  envName: string;
  client: GoogleGenAI;
};

const TRIAGE_URGENT_MESSAGE_CUES = [
  "urgent",
  "asap",
  "as soon as possible",
  "emergency",
  "hospital",
  "sick",
  "ill",
  "fever",
  "funeral",
  "car broke down",
  "transport broke down",
  "weather warning",
] as const;

const TRIAGE_ROUTINE_MESSAGE_CUES = [
  "work conflict",
  "schedule conflict",
  "timing conflict",
  "not at the current time",
  "need to move",
  "move this",
  "move it",
  "reschedule",
  "different time",
  "earlier",
  "later",
  "instead",
  "can do",
  "could do",
] as const;

const RESCHEDULE_TRIAGE_FEW_SHOT_EXAMPLES = [
  {
    requestContext: {
      request: {
        message: "I have a work conflict at that hour. Could I move this to Friday morning instead?",
        preferredStartAtUtc: "2026-05-02T14:00:00.000Z",
      },
      appointment: {
        hoursUntilAppointment: 52,
        status: "reschedule_requested",
      },
    },
    expectedOutput: {
      urgency: "medium",
      likelyReasonCategory: "work_conflict",
      confidence: "high",
      recommendedAction: "offer_alternatives",
      needsHumanFollowUp: false,
      operationalRisk: "watch",
      adminSummary:
        "Routine schedule-conflict reschedule request with a proposed new time; handle through normal scheduling review.",
      suggestedReply:
        "Thanks for the update. We received your request to move this appointment and will review the proposed time. If that slot is not available, we will follow up with the next best options.",
      riskFlags: ["time change requested"],
    },
  },
  {
    requestContext: {
      request: {
        message:
          "I may not be able to attend tomorrow after all. Please call me as soon as possible because there is a medical issue.",
        preferredStartAtUtc: "2026-05-01T16:00:00.000Z",
      },
      appointment: {
        hoursUntilAppointment: 10,
        status: "reschedule_requested",
      },
    },
    expectedOutput: {
      urgency: "high",
      likelyReasonCategory: "health_issue",
      confidence: "high",
      recommendedAction: "contact_client",
      needsHumanFollowUp: true,
      operationalRisk: "urgent",
      adminSummary:
        "Short-notice health-related request that needs direct follow-up before the appointment window is missed.",
      suggestedReply:
        "Thanks for letting us know. We are reviewing this urgently and will contact you shortly to help with the next step.",
      riskFlags: ["short notice", "health issue", "direct follow-up needed"],
    },
  },
] as const;

const REMINDER_COPY_FEW_SHOT_EXAMPLES = [
  {
    context: {
      eventType: "confirmation_request",
      tone: "warm",
      includeLocation: true,
      includeRescheduleOption: true,
    },
    expectedOutput: {
      subject: "Please confirm: {{appointment_title}} on {{appointment_start_local}}",
      previewText: "Please confirm your upcoming appointment with Northshore Wellness Clinic.",
      bodyText:
        "Hi {{client_name}},\n\nPlease confirm your upcoming {{appointment_title}} appointment for {{appointment_start_local}} ({{display_timezone}}).\n\nLocation: {{location_name}}\n\nConfirm attendance: {{confirm_url}}\nRequest a reschedule: {{reschedule_url}}\n\nThank you,\nClient Care Team",
      rationale:
        "Warm but transactional confirmation copy that leads with the action the client needs to take.",
      placeholdersUsed: [
        "{{client_name}}",
        "{{appointment_title}}",
        "{{appointment_start_local}}",
        "{{display_timezone}}",
        "{{location_name}}",
        "{{confirm_url}}",
        "{{reschedule_url}}",
      ],
    },
  },
  {
    context: {
      eventType: "reminder",
      tone: "concise",
      includeLocation: false,
      includeRescheduleOption: false,
    },
    expectedOutput: {
      subject: "Reminder: {{appointment_title}} tomorrow",
      previewText: "A quick reminder about your appointment with Northshore Wellness Clinic.",
      bodyText:
        "Hi {{client_name}},\n\nThis is a reminder about your {{appointment_title}} appointment on {{appointment_start_local}} ({{display_timezone}}).\n\nConfirm attendance: {{confirm_url}}\n\nThank you,\nClient Care Team",
      rationale:
        "Concise operational reminder copy with no unnecessary detail and no reschedule language.",
      placeholdersUsed: [
        "{{client_name}}",
        "{{appointment_title}}",
        "{{appointment_start_local}}",
        "{{display_timezone}}",
        "{{confirm_url}}",
      ],
    },
  },
] as const;

function stripJsonCodeFence(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue.startsWith("```") && normalizedValue.endsWith("```")) {
    return normalizedValue
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
  }

  return normalizedValue;
}

function loadGeminiApiKeys() {
  const numberedKeys = Object.entries(process.env)
    .map(([envName, value]) => {
      const match = envName.match(/^GEMINI_API_KEY_(\d+)$/);

      return {
        envName,
        sortOrder: match ? Number(match[1]) : Number.POSITIVE_INFINITY,
        value: (value ?? "").trim(),
        matchesNumberedPattern: Boolean(match),
      };
    })
    .filter((entry) => entry.matchesNumberedPattern && entry.value.length > 0)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(({ envName, value }) => ({ envName, value }));

  const fallbackKeys = [
    {
      envName: "GEMINI_API_KEY",
      value: (process.env.GEMINI_API_KEY ?? "").trim(),
    },
    {
      envName: "GOOGLE_API_KEY",
      value: (process.env.GOOGLE_API_KEY ?? "").trim(),
    },
  ].filter((entry) => entry.value.length > 0);

  const deduplicatedKeys = new Map<string, { envName: string; value: string }>();

  for (const entry of [...numberedKeys, ...fallbackKeys]) {
    if (!deduplicatedKeys.has(entry.value)) {
      deduplicatedKeys.set(entry.value, entry);
    }
  }

  return [...deduplicatedKeys.values()];
}

function hasCue(message: string, cues: readonly string[]) {
  return cues.some((cue) => message.includes(cue));
}

function limitText(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength).trim() : value;
}

function normalizeRescheduleTriage(
  context: RescheduleTriageContext,
  triage: RescheduleTriage,
): RescheduleTriage {
  const message = (context.request.message ?? "").trim().toLowerCase();
  const hasUrgentCue = hasCue(message, TRIAGE_URGENT_MESSAGE_CUES);
  const hasRoutineCue = hasCue(message, TRIAGE_ROUTINE_MESSAGE_CUES);
  const hasPreferredTime = Boolean(context.request.preferredStartAtUtc);
  const hoursUntilAppointment = context.appointment.hoursUntilAppointment;

  const looksRoutineSchedulingRequest =
    hasPreferredTime &&
    !hasUrgentCue &&
    hoursUntilAppointment >= 18 &&
    (hasRoutineCue || message.length > 0);

  if (!looksRoutineSchedulingRequest) {
    return triage;
  }

  const nextTriage: RescheduleTriage = {
    ...triage,
    riskFlags: [...triage.riskFlags],
  };

  if (nextTriage.recommendedAction === "contact_client") {
    nextTriage.recommendedAction = "offer_alternatives";
  }

  if (nextTriage.urgency === "high") {
    nextTriage.urgency = "medium";
  }

  if (nextTriage.operationalRisk === "urgent") {
    nextTriage.operationalRisk = "watch";
  }

  if (nextTriage.likelyReasonCategory === "other") {
    nextTriage.likelyReasonCategory = "schedule_conflict";
  }

  nextTriage.needsHumanFollowUp = false;

  nextTriage.adminSummary = limitText(
    `Routine reschedule request for ${context.appointment.title}. The client proposed a new time and this can be handled through normal scheduling review.`,
    240,
  );
  nextTriage.suggestedReply = limitText(
    "Thanks for the update. We received your request to move this appointment and will review the proposed time. If that slot is not available, we will follow up with the next best options.",
    320,
  );
  nextTriage.riskFlags = nextTriage.riskFlags
    .filter((flag) => !/urgent|immediate|escalat/i.test(flag))
    .slice(0, 3);

  if (nextTriage.riskFlags.length === 0) {
    nextTriage.riskFlags = ["time change requested"];
  }

  if (
    hoursUntilAppointment >= 48 &&
    nextTriage.urgency === "low" &&
    nextTriage.operationalRisk === "watch"
  ) {
    nextTriage.operationalRisk = "none";
  }

  return nextTriage;
}

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private readonly model = (process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim();
  private readonly clients: GeminiClientEntry[] = loadGeminiApiKeys().map((entry) => ({
    envName: entry.envName,
    client: new GoogleGenAI({
      apiKey: entry.value,
    }),
  }));
  private nextClientIndex = 0;

  isConfigured() {
    return this.clients.length > 0;
  }

  async triageRescheduleRequest(
    context: RescheduleTriageContext,
  ): Promise<RescheduleTriageProviderResult> {
    const result = await this.executeWithFailover({
      eventName: "ai.reschedule_triage",
      logContext: {
        requestId: context.request.id,
      },
      buildRequest: () => ({
        contents: JSON.stringify(
          {
            currentUtc: new Date().toISOString(),
            businessProfile: {
              type: "appointment_based_service_business",
              targetMarkets: ["United States", "Canada", "United Kingdom"],
              objective:
                "Reduce no-shows, protect schedule utilization, and keep client communication professional.",
            },
            fewShotExamples: RESCHEDULE_TRIAGE_FEW_SHOT_EXAMPLES,
            requestContext: context,
          },
          null,
          2,
        ),
        config: {
          systemInstruction: `
You are an operations copilot for a small appointment-based business.
Analyze one client reschedule request like an experienced front-desk manager.
Return JSON only and match the schema exactly.
Do not invent availability, business policies, or facts that are not in the input.
Keep "adminSummary" under 240 characters.
Keep "suggestedReply" under 320 characters.
Keep "riskFlags" short and practical with no more than 3 items.
Use "accept_requested_time" when the requested time looks clear and routine.
Use "offer_alternatives" when the request is valid but needs scheduling flexibility.
Use "contact_client" when the message is sensitive, confusing, contradictory, or operationally risky.
Use "dismiss_request" only when the request is clearly invalid, duplicate, or already resolved.
Set "operationalRisk" to "urgent" only when there is a meaningful risk of a missed appointment, escalation, or manual intervention.
For routine schedule conflicts with a proposed new time and no urgent risk signals, prefer "offer_alternatives" over "contact_client".
Do not classify a normal timing conflict more than 24 hours out as high urgency unless the message itself clearly signals urgency.
Do not mention AI in the reply draft.
          `.trim(),
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema: RESCHEDULE_TRIAGE_JSON_SCHEMA,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
      parseResponse: parseRescheduleTriage,
    });

    return {
      provider: "gemini",
      model: this.model,
      triage: normalizeRescheduleTriage(context, result),
    };
  }

  async generateReminderCopy(context: ReminderCopyContext): Promise<ReminderCopyProviderResult> {
    const result = await this.executeWithFailover({
      eventName: "ai.reminder_copy",
      logContext: {
        reminderRuleId: context.reminderRule.id,
        eventType: context.reminderRule.eventType,
      },
      buildRequest: () => ({
        contents: JSON.stringify(
          {
            currentUtc: new Date().toISOString(),
            targetMarkets: ["United States", "Canada", "United Kingdom"],
            allowedPlaceholders: [...REMINDER_COPY_PLACEHOLDERS],
            fewShotExamples: REMINDER_COPY_FEW_SHOT_EXAMPLES,
            reminderCopyContext: context,
          },
          null,
          2,
        ),
        config: {
          systemInstruction: `
You are an operations copywriter for a small appointment-based business.
Generate transactional reminder email copy, not marketing copy.
Return JSON only and match the schema exactly.
The copy must sound credible for clients in the United States, Canada, and the United Kingdom.
Use only these runtime placeholders when dynamic values are needed:
${REMINDER_COPY_PLACEHOLDERS.join(", ")}
Never invent new placeholders.
Keep the subject concise, operational, and under 90 characters.
Keep preview text under 160 characters.
Keep the body plain text, practical, and easy for a busy client to scan.
The body should use short paragraphs and natural line breaks.
If includeLocation is false, do not mention location_name.
If includeRescheduleOption is false, do not reference reschedule_url or rescheduling language.
Always keep the copy transactional and avoid sales language, hype, or emojis.
Match the rule intent: confirmation requests should clearly ask for confirmation, reminders should read like reminders, and follow-ups should sound post-appointment.
The rationale should be short, internal-facing, and explain why the message fits the selected rule and tone.
          `.trim(),
          temperature: 0.35,
          responseMimeType: "application/json",
          responseJsonSchema: REMINDER_COPY_JSON_SCHEMA,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
      parseResponse: parseReminderCopyDraft,
    });

    return {
      provider: "gemini",
      model: this.model,
      draft: result,
    };
  }

  private async executeWithFailover<TResult>(input: {
    eventName: string;
    logContext: Record<string, unknown>;
    buildRequest: () => {
      contents: string;
      config: Record<string, unknown>;
    };
    parseResponse: (value: unknown) => TResult;
  }) {
    const clients = this.requireClients();
    let lastError: unknown = null;

    for (let attempt = 0; attempt < clients.length; attempt += 1) {
      const clientEntry = clients[attempt];

      try {
        const response = await clientEntry.client.models.generateContent({
          model: this.model,
          ...input.buildRequest(),
        });

        const rawText = stripJsonCodeFence(response.text ?? "");
        if (!rawText) {
          throw new Error("Gemini returned an empty response.");
        }

        const parsedPayload = JSON.parse(rawText) as unknown;
        return input.parseResponse(parsedPayload);
      } catch (error) {
        lastError = error;
        const status = this.getErrorStatus(error);
        const shouldFailover = FAILOVER_STATUS_CODES.has(status ?? Number.NaN);

        if (shouldFailover && attempt + 1 < clients.length) {
          this.logger.warn({
            event: `${input.eventName}.failover`,
            model: this.model,
            status,
            exhaustedKeySlot: clientEntry.envName,
            nextKeySlot: clients[attempt + 1]?.envName,
            message: error instanceof Error ? error.message : "Unknown Gemini error",
            ...input.logContext,
          });
          continue;
        }

        this.logger.error({
          event: `${input.eventName}.failed`,
          model: this.model,
          status,
          keySlot: clientEntry.envName,
          message: error instanceof Error ? error.message : "Unknown Gemini error",
          ...input.logContext,
        });
        break;
      }
    }

    if (lastError instanceof ServiceUnavailableException) {
      throw lastError;
    }

    throw new ServiceUnavailableException("AI generation is unavailable right now.");
  }

  private requireClients() {
    if (this.clients.length === 0) {
      throw new ServiceUnavailableException(
        "Configure GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY, or GOOGLE_API_KEY.",
      );
    }

    const startIndex = this.nextClientIndex % this.clients.length;
    this.nextClientIndex = (startIndex + 1) % this.clients.length;

    return Array.from({ length: this.clients.length }, (_, offset) => {
      return this.clients[(startIndex + offset) % this.clients.length]!;
    });
  }

  private getErrorStatus(error: unknown) {
    if (error instanceof ApiError) {
      return error.status;
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      return error.status;
    }

    return null;
  }
}
