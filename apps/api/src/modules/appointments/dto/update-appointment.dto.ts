import { BadRequestException } from "@nestjs/common";

import {
  asRecord,
  parseOptionalDate,
  parseOptionalEnum,
  parseOptionalString,
} from "../../../common/validation/request-parsers.js";
import {
  APPOINTMENT_STATUSES,
  CONFIRMATION_STATUSES,
} from "../../../common/utils/domain-constants.js";

export interface UpdateAppointmentInput {
  title?: string;
  locationName?: string | null;
  startsAtUtc?: Date;
  endsAtUtc?: Date | null;
  displayTimezone?: string;
  status?: (typeof APPOINTMENT_STATUSES)[number];
  confirmationStatus?: (typeof CONFIRMATION_STATUSES)[number];
  externalReference?: string | null;
}

export function parseUpdateAppointmentInput(body: unknown): UpdateAppointmentInput {
  const payload = asRecord(body);
  const title = parseOptionalString(payload, "title", {
    minLength: 2,
    maxLength: 160,
  });
  const locationName = parseOptionalString(payload, "locationName", {
    maxLength: 160,
  });
  const startsAtUtc = parseOptionalDate(payload, "startsAtUtc");
  const endsAtUtc = parseOptionalDate(payload, "endsAtUtc");
  const displayTimezone = parseOptionalString(payload, "displayTimezone", {
    minLength: 3,
    maxLength: 120,
  });
  const status = parseOptionalEnum(payload, "status", APPOINTMENT_STATUSES);
  const confirmationStatus = parseOptionalEnum(
    payload,
    "confirmationStatus",
    CONFIRMATION_STATUSES,
  );
  const externalReference = parseOptionalString(payload, "externalReference", {
    maxLength: 160,
  });

  if (
    title === undefined &&
    locationName === undefined &&
    startsAtUtc === undefined &&
    endsAtUtc === undefined &&
    displayTimezone === undefined &&
    status === undefined &&
    confirmationStatus === undefined &&
    externalReference === undefined
  ) {
    throw new BadRequestException("At least one appointment field must be provided.");
  }

  return {
    ...(title !== undefined && title !== null ? { title } : {}),
    ...(locationName !== undefined ? { locationName } : {}),
    ...(startsAtUtc !== undefined && startsAtUtc !== null ? { startsAtUtc } : {}),
    ...(endsAtUtc !== undefined ? { endsAtUtc } : {}),
    ...(displayTimezone !== undefined && displayTimezone !== null ? { displayTimezone } : {}),
    ...(status !== undefined && status !== null ? { status } : {}),
    ...(confirmationStatus !== undefined && confirmationStatus !== null
      ? { confirmationStatus }
      : {}),
    ...(externalReference !== undefined ? { externalReference } : {}),
  };
}
