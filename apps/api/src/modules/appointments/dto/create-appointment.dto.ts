import {
  asRecord,
  ensureFutureDate,
  ensureTimeOrder,
  ensureValidTimeZone,
  parseOptionalBoolean,
  parseOptionalDate,
  parseOptionalString,
  parseRequiredDate,
  parseRequiredEmail,
  parseRequiredString,
} from "../../../common/validation/request-parsers.js";

export interface CreateAppointmentInput {
  fullName: string;
  email: string;
  phone?: string | null;
  contactTimezone: string;
  emailOptOut: boolean;
  title: string;
  locationName?: string | null;
  startsAtUtc: Date;
  endsAtUtc?: Date | null;
  displayTimezone: string;
  externalReference?: string | null;
}

export function parseCreateAppointmentInput(body: unknown): CreateAppointmentInput {
  const payload = asRecord(body);
  const fullName = parseRequiredString(payload, "fullName", {
    minLength: 2,
    maxLength: 120,
  });
  const email = parseRequiredEmail(payload, "email");
  const phone = parseOptionalString(payload, "phone", {
    maxLength: 30,
  });
  const contactTimezone = parseRequiredString(payload, "contactTimezone", {
    minLength: 3,
    maxLength: 120,
  });
  const emailOptOut = parseOptionalBoolean(payload, "emailOptOut") ?? false;
  const title = parseRequiredString(payload, "title", {
    minLength: 2,
    maxLength: 160,
  });
  const locationName = parseOptionalString(payload, "locationName", {
    maxLength: 160,
  });
  const startsAtUtc = parseRequiredDate(payload, "startsAtUtc");
  const endsAtUtc = parseOptionalDate(payload, "endsAtUtc");
  const displayTimezone = parseRequiredString(payload, "displayTimezone", {
    minLength: 3,
    maxLength: 120,
  });
  const externalReference = parseOptionalString(payload, "externalReference", {
    maxLength: 160,
  });

  ensureFutureDate(startsAtUtc, "startsAtUtc");
  if (endsAtUtc) {
    ensureTimeOrder(startsAtUtc, endsAtUtc);
  }
  ensureValidTimeZone(contactTimezone, "contactTimezone");
  ensureValidTimeZone(displayTimezone, "displayTimezone");

  return {
    fullName,
    email,
    contactTimezone,
    emailOptOut,
    title,
    startsAtUtc,
    displayTimezone,
    ...(phone !== undefined ? { phone } : {}),
    ...(locationName !== undefined ? { locationName } : {}),
    ...(endsAtUtc !== undefined ? { endsAtUtc } : {}),
    ...(externalReference !== undefined ? { externalReference } : {}),
  };
}
