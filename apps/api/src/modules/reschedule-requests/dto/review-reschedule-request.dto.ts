import { BadRequestException } from "@nestjs/common";

import {
  asRecord,
  ensureFutureDate,
  ensureValidTimeZone,
  parseOptionalDate,
  parseOptionalString,
  parseRequiredString,
} from "../../../common/validation/request-parsers.js";

export interface ReviewRescheduleRequestInput {
  decision: "accept" | "dismiss";
  reviewedBy: string;
  preferredStartAtUtc?: Date;
  preferredTimezone?: string;
}

export function parseReviewRescheduleRequestInput(body: unknown): ReviewRescheduleRequestInput {
  const payload = asRecord(body);
  const decision = parseRequiredString(payload, "decision", {
    minLength: 6,
    maxLength: 7,
  });
  const reviewedBy = parseRequiredString(payload, "reviewedBy", {
    minLength: 2,
    maxLength: 120,
  });
  const preferredStartAtUtc = parseOptionalDate(payload, "preferredStartAtUtc");
  const preferredTimezone = parseOptionalString(payload, "preferredTimezone", {
    minLength: 3,
    maxLength: 120,
  });

  if (decision !== "accept" && decision !== "dismiss") {
    throw new BadRequestException("decision must be either accept or dismiss.");
  }

  if (preferredStartAtUtc) {
    ensureFutureDate(preferredStartAtUtc, "preferredStartAtUtc");
  }
  if (preferredTimezone) {
    ensureValidTimeZone(preferredTimezone, "preferredTimezone");
  }

  return {
    decision,
    reviewedBy,
    ...(preferredStartAtUtc ? { preferredStartAtUtc } : {}),
    ...(preferredTimezone ? { preferredTimezone } : {}),
  };
}
