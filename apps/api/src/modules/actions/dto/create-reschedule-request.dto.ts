import {
  asRecord,
  ensureFutureDate,
  ensureValidTimeZone,
  parseOptionalString,
  parseRequiredDate,
  parseRequiredString,
} from "../../../common/validation/request-parsers.js";

export interface CreateRescheduleRequestInput {
  preferredStartAtUtc: Date;
  preferredTimezone: string;
  message?: string | null;
}

export function parseCreateRescheduleRequestInput(body: unknown): CreateRescheduleRequestInput {
  const payload = asRecord(body);
  const preferredStartAtUtc = parseRequiredDate(payload, "preferredStartAtUtc");
  const preferredTimezone = parseRequiredString(payload, "preferredTimezone", {
    minLength: 3,
    maxLength: 120,
  });
  const message = parseOptionalString(payload, "message", {
    maxLength: 1000,
  });

  ensureFutureDate(preferredStartAtUtc, "preferredStartAtUtc");
  ensureValidTimeZone(preferredTimezone, "preferredTimezone");

  return {
    preferredStartAtUtc,
    preferredTimezone,
    ...(message !== undefined ? { message } : {}),
  };
}
