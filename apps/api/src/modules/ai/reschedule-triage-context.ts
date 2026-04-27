import { Prisma } from "../../generated/prisma/client.js";
import {
  parseRescheduleTriage,
  type RescheduleTriage,
  type RescheduleTriageContext,
} from "../../integrations/ai/ai.types.js";

export const RESCHEDULE_REQUEST_TRIAGE_INCLUDE = {
  appointment: {
    include: {
      contact: true,
    },
  },
} satisfies Prisma.RescheduleRequestInclude;

export type RescheduleRequestWithContext = Prisma.RescheduleRequestGetPayload<{
  include: typeof RESCHEDULE_REQUEST_TRIAGE_INCLUDE;
}>;

export type PersistedRescheduleTriageSnapshot = {
  provider: "gemini";
  model: string;
  generatedAt: string;
  triage: RescheduleTriage;
};

export function buildRescheduleTriageContext(
  request: RescheduleRequestWithContext,
): RescheduleTriageContext {
  const now = Date.now();
  const hoursUntilAppointment = Number(
    ((request.appointment.startsAtUtc.getTime() - now) / (60 * 60 * 1000)).toFixed(1),
  );

  return {
    request: {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      preferredStartAtUtc: request.preferredStartAtUtc.toISOString(),
      preferredTimezone: request.preferredTimezone,
      ...(request.message ? { message: request.message } : {}),
    },
    appointment: {
      id: request.appointment.id,
      title: request.appointment.title,
      startsAtUtc: request.appointment.startsAtUtc.toISOString(),
      displayTimezone: request.appointment.displayTimezone,
      status: request.appointment.status,
      confirmationStatus: request.appointment.confirmationStatus,
      hoursUntilAppointment,
      ...(request.appointment.locationName ? { locationName: request.appointment.locationName } : {}),
      ...(request.appointment.endsAtUtc
        ? { endsAtUtc: request.appointment.endsAtUtc.toISOString() }
        : {}),
      ...(request.appointment.externalReference
        ? { externalReference: request.appointment.externalReference }
        : {}),
    },
    contact: {
      fullName: request.appointment.contact.fullName,
      email: request.appointment.contact.email,
      timezone: request.appointment.contact.timezone,
      emailOptOut: request.appointment.contact.emailOptOut,
    },
  };
}

export function parsePersistedRescheduleTriageSnapshot(input: {
  aiTriageJson: Prisma.JsonValue | null;
  aiTriageProvider: string | null;
  aiTriageModel: string | null;
  aiTriageGeneratedAt: Date | null;
}): PersistedRescheduleTriageSnapshot | null {
  if (
    !input.aiTriageJson ||
    input.aiTriageProvider !== "gemini" ||
    !input.aiTriageModel ||
    !input.aiTriageGeneratedAt
  ) {
    return null;
  }

  try {
    return {
      provider: "gemini",
      model: input.aiTriageModel,
      generatedAt: input.aiTriageGeneratedAt.toISOString(),
      triage: parseRescheduleTriage(input.aiTriageJson),
    };
  } catch {
    return null;
  }
}
