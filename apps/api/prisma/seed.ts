import { faker } from "@faker-js/faker";

import { hashActionToken } from "../src/common/utils/action-tokens.js";
import type { RescheduleTriage } from "../src/integrations/ai/ai.types.js";
import { createPrismaClient } from "../src/lib/prisma.js";

const prisma = createPrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const SEED = 20260425;
const SEED_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
} as const;
const publicWebUrl = (process.env.PUBLIC_WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");

faker.seed(SEED);

type SupportedTimezone =
  | "America/New_York"
  | "America/Chicago"
  | "America/Los_Angeles"
  | "America/Toronto"
  | "Europe/London";

type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "reschedule_requested"
  | "canceled"
  | "completed"
  | "no_show";

type ConfirmationStatus = "pending" | "confirmed" | "expired" | "skipped";

type ReminderEventType = "confirmation_request" | "reminder";
type ReminderRuleName = "Immediate confirmation request" | "24 hour reminder" | "1 hour reminder";

type ReminderEventStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "failed"
  | "canceled"
  | "skipped";

type EventState =
  | "pending"
  | "pending_due"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "failed"
  | "canceled"
  | "skipped_optout"
  | "skipped_late";

type ScenarioType =
  | "completed_engaged"
  | "completed_standard"
  | "completed_optout"
  | "no_show_expired"
  | "no_show_confirmed"
  | "canceled_before_24h"
  | "canceled_after_24h"
  | "upcoming_confirmed"
  | "upcoming_pending"
  | "upcoming_due_confirmation"
  | "upcoming_due_24h"
  | "upcoming_due_1h"
  | "upcoming_reschedule_pending"
  | "upcoming_optout";

type EngagementProfile = "quiet" | "delivered" | "opened" | "clicked" | "bounce_risk" | "failure_risk";

type RuleRecord = {
  id: string;
};

type EventSpec = {
  ruleName: ReminderRuleName;
  eventType: ReminderEventType;
  scheduledForUtc: Date;
  state: EventState;
  reasonAt?: Date | null;
};

type RescheduleHistorySpec = {
  status: "pending" | "accepted" | "dismissed";
  createdAt: Date;
  preferredStartAtUtc: Date;
  preferredTimezone: SupportedTimezone;
  message: string;
  reviewedAt?: Date;
  reviewedBy?: string;
};

type AppointmentSeedSpec = {
  scenario: ScenarioType;
  timezone: SupportedTimezone;
  startsAtUtc: Date;
  durationMinutes: number;
  createdAt: Date;
  title: string;
  locationName: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailOptOut: boolean;
  engagement: EngagementProfile;
  externalReference: string;
  note?: string;
  addAcceptedRescheduleHistory?: boolean;
  addDismissedRescheduleHistory?: boolean;
};

type Lifecycle = {
  status: AppointmentStatus;
  confirmationStatus: ConfirmationStatus;
  confirmUsedAt?: Date;
  rescheduleUsedAt?: Date;
  cancellationAt?: Date;
  eventSpecs: EventSpec[];
  rescheduleRequests: RescheduleHistorySpec[];
};

type SampleLink = {
  name: string;
  externalReference: string;
  confirmUrl: string;
  rescheduleUrl: string;
  note?: string;
};

type SeedRescheduleTriageSnapshot = {
  provider: "gemini";
  model: string;
  generatedAt: Date;
  triage: RescheduleTriage;
};

const supportedTimezones: Array<{
  timezone: SupportedTimezone;
  weight: number;
  domains: string[];
  locations: string[];
}> = [
  {
    timezone: "America/New_York",
    weight: 28,
    domains: ["brightpathcare.com", "eastbaywellness.com"],
    locations: ["Midtown Clinic", "Virtual Session", "Harbor View Office"],
  },
  {
    timezone: "America/Chicago",
    weight: 17,
    domains: ["lakesidepractice.com", "northloopcare.com"],
    locations: ["Loop Office", "West End Clinic", "Secure Video Room"],
  },
  {
    timezone: "America/Los_Angeles",
    weight: 16,
    domains: ["coastlinecare.com", "sunsetwellness.com"],
    locations: ["Santa Monica Suite", "Virtual Session", "Westside Practice"],
  },
  {
    timezone: "America/Toronto",
    weight: 19,
    domains: ["riverfrontclinic.ca", "northharbourcare.ca"],
    locations: ["Downtown Clinic", "Virtual Session", "North York Office"],
  },
  {
    timezone: "Europe/London",
    weight: 20,
    domains: ["oakwellpractice.co.uk", "citybridgecare.co.uk"],
    locations: ["Canary Wharf Office", "Telehealth Room", "Marylebone Practice"],
  },
];

const appointmentTitles = [
  { value: "Initial Consultation", weight: 14 },
  { value: "Treatment Plan Follow-up", weight: 16 },
  { value: "Progress Review", weight: 18 },
  { value: "Virtual Check-in", weight: 12 },
  { value: "Care Coordination Session", weight: 10 },
  { value: "Therapy Session", weight: 12 },
  { value: "Annual Wellness Review", weight: 8 },
  { value: "Return Client Consultation", weight: 10 },
];

const durationWeights = [
  { value: 30, weight: 24 },
  { value: 45, weight: 32 },
  { value: 60, weight: 30 },
  { value: 90, weight: 14 },
];

const timeSlots = [
  { value: { hour: 9, minute: 0 }, weight: 9 },
  { value: { hour: 9, minute: 30 }, weight: 5 },
  { value: { hour: 10, minute: 0 }, weight: 11 },
  { value: { hour: 10, minute: 30 }, weight: 6 },
  { value: { hour: 11, minute: 0 }, weight: 10 },
  { value: { hour: 11, minute: 30 }, weight: 5 },
  { value: { hour: 12, minute: 0 }, weight: 3 },
  { value: { hour: 13, minute: 0 }, weight: 10 },
  { value: { hour: 13, minute: 30 }, weight: 7 },
  { value: { hour: 14, minute: 0 }, weight: 12 },
  { value: { hour: 14, minute: 30 }, weight: 8 },
  { value: { hour: 15, minute: 0 }, weight: 12 },
  { value: { hour: 15, minute: 30 }, weight: 8 },
  { value: { hour: 16, minute: 0 }, weight: 10 },
  { value: { hour: 16, minute: 30 }, weight: 6 },
  { value: { hour: 17, minute: 0 }, weight: 7 },
];

const scenarioWeights = [
  { value: "completed_engaged" as const, weight: 20 },
  { value: "completed_standard" as const, weight: 20 },
  { value: "completed_optout" as const, weight: 3 },
  { value: "no_show_expired" as const, weight: 7 },
  { value: "no_show_confirmed" as const, weight: 4 },
  { value: "canceled_before_24h" as const, weight: 6 },
  { value: "canceled_after_24h" as const, weight: 7 },
  { value: "upcoming_confirmed" as const, weight: 11 },
  { value: "upcoming_pending" as const, weight: 8 },
  { value: "upcoming_due_confirmation" as const, weight: 3 },
  { value: "upcoming_due_24h" as const, weight: 3 },
  { value: "upcoming_due_1h" as const, weight: 2 },
  { value: "upcoming_reschedule_pending" as const, weight: 4 },
  { value: "upcoming_optout" as const, weight: 2 },
];

const reminderRules = [
  {
    name: "Immediate confirmation request" as const,
    eventType: "confirmation_request" as const,
    offsetMinutes: 0,
  },
  {
    name: "24 hour reminder" as const,
    eventType: "reminder" as const,
    offsetMinutes: -24 * 60,
  },
  {
    name: "1 hour reminder" as const,
    eventType: "reminder" as const,
    offsetMinutes: -60,
  },
];

let providerMessageCounter = 0;
let webhookCounter = 0;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

function addHours(date: Date, hours: number) {
  return addMinutes(date, hours * 60);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function normalizeNameForEmail(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .toLowerCase()
    .replace(/[_\s-]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\./, "")
    .replace(/\.$/, "");
}

function weightedValue<T>(values: ReadonlyArray<{ value: T; weight: number }>) {
  return faker.helpers.weightedArrayElement(values);
}

const timeZoneFormatters = new Map<SupportedTimezone, Intl.DateTimeFormat>();

function getTimeZoneFormatter(timezone: SupportedTimezone) {
  const existing = timeZoneFormatters.get(timezone);
  if (existing) {
    return existing;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  timeZoneFormatters.set(timezone, formatter);
  return formatter;
}

function getTimeZoneParts(date: Date, timezone: SupportedTimezone) {
  const parts = getTimeZoneFormatter(timezone).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

function createZonedDate(
  timezone: SupportedTimezone,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = new Date(desiredAsUtc);

  for (let index = 0; index < 4; index += 1) {
    const parts = getTimeZoneParts(guess, timezone);
    const actualAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const delta = desiredAsUtc - actualAsUtc;

    if (delta === 0) {
      return guess;
    }

    guess = new Date(guess.getTime() + delta);
  }

  return guess;
}

function getLocalCalendarToday(timezone: SupportedTimezone, now: Date) {
  const parts = getTimeZoneParts(now, timezone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function addLocalDays(localCalendarDate: Date, days: number) {
  return new Date(
    Date.UTC(
      localCalendarDate.getUTCFullYear(),
      localCalendarDate.getUTCMonth(),
      localCalendarDate.getUTCDate() + days,
    ),
  );
}

function pickLocalDayOffset(timezone: SupportedTimezone, now: Date, min: number, max: number) {
  const localToday = getLocalCalendarToday(timezone, now);
  const candidates: Array<{ value: number; weight: number }> = [];

  for (let dayOffset = min; dayOffset <= max; dayOffset += 1) {
    const localDay = addLocalDays(localToday, dayOffset);
    const weekday = localDay.getUTCDay();
    const weightByWeekday = [0.15, 1.1, 1.15, 1.15, 1.1, 0.95, 0.45][weekday] ?? 0.6;

    candidates.push({
      value: dayOffset,
      weight: dayOffset >= -7 && dayOffset <= 5 ? weightByWeekday + 0.25 : weightByWeekday,
    });
  }

  return weightedValue(candidates);
}

function buildBusinessStart(
  timezone: SupportedTimezone,
  now: Date,
  minDayOffset: number,
  maxDayOffset: number,
) {
  const dayOffset = pickLocalDayOffset(timezone, now, minDayOffset, maxDayOffset);
  const localToday = getLocalCalendarToday(timezone, now);
  const localDay = addLocalDays(localToday, dayOffset);
  const slot = weightedValue(timeSlots);

  return createZonedDate(
    timezone,
    localDay.getUTCFullYear(),
    localDay.getUTCMonth() + 1,
    localDay.getUTCDate(),
    slot.hour,
    slot.minute,
  );
}

function getLocalHour(date: Date, timezone: SupportedTimezone) {
  return getTimeZoneParts(date, timezone).hour;
}

function pickTimezoneForRelativeBusinessWindow(
  now: Date,
  predicate: (localHour: number) => boolean,
) {
  const candidates = supportedTimezones
    .map((item) => ({
      value: item.timezone,
      weight: predicate(getLocalHour(now, item.timezone)) ? item.weight : 0,
    }))
    .filter((item) => item.weight > 0);

  if (candidates.length > 0) {
    return weightedValue(candidates);
  }

  return weightedValue(supportedTimezones.map(({ timezone, weight }) => ({ value: timezone, weight })));
}

function pickTimezone() {
  return weightedValue(supportedTimezones.map(({ timezone, weight }) => ({ value: timezone, weight })));
}

function pickDurationMinutes(scenario: ScenarioType) {
  if (scenario === "upcoming_due_1h") {
    return weightedValue([
      { value: 30, weight: 46 },
      { value: 45, weight: 34 },
      { value: 60, weight: 20 },
    ]);
  }

  return weightedValue(durationWeights);
}

function pickLeadHours(scenario: ScenarioType) {
  switch (scenario) {
    case "completed_engaged":
    case "completed_standard":
    case "no_show_expired":
    case "no_show_confirmed":
      return faker.number.int({ min: 48, max: 21 * 24 });
    case "completed_optout":
      return faker.number.int({ min: 24, max: 14 * 24 });
    case "canceled_before_24h":
    case "canceled_after_24h":
      return faker.number.int({ min: 36, max: 16 * 24 });
    case "upcoming_confirmed":
      return faker.number.int({ min: 18, max: 14 * 24 });
    case "upcoming_pending":
      return faker.number.int({ min: 8, max: 10 * 24 });
    case "upcoming_due_confirmation":
      return faker.number.int({ min: 3, max: 30 });
    case "upcoming_due_24h":
      return faker.number.int({ min: 48, max: 18 * 24 });
    case "upcoming_due_1h":
      return faker.number.int({ min: 8, max: 5 * 24 });
    case "upcoming_reschedule_pending":
      return faker.number.int({ min: 36, max: 12 * 24 });
    case "upcoming_optout":
      return faker.number.int({ min: 12, max: 10 * 24 });
  }
}

function pickEngagement(scenario: ScenarioType): EngagementProfile {
  switch (scenario) {
    case "completed_engaged":
    case "upcoming_confirmed":
      return weightedValue([
        { value: "clicked" as const, weight: 34 },
        { value: "opened" as const, weight: 42 },
        { value: "delivered" as const, weight: 24 },
      ]);
    case "completed_standard":
      return weightedValue([
        { value: "opened" as const, weight: 42 },
        { value: "delivered" as const, weight: 38 },
        { value: "quiet" as const, weight: 20 },
      ]);
    case "no_show_expired":
      return weightedValue([
        { value: "delivered" as const, weight: 40 },
        { value: "opened" as const, weight: 35 },
        { value: "failure_risk" as const, weight: 25 },
      ]);
    case "no_show_confirmed":
      return weightedValue([
        { value: "opened" as const, weight: 45 },
        { value: "clicked" as const, weight: 35 },
        { value: "delivered" as const, weight: 20 },
      ]);
    case "canceled_before_24h":
      return weightedValue([
        { value: "quiet" as const, weight: 35 },
        { value: "delivered" as const, weight: 45 },
        { value: "opened" as const, weight: 20 },
      ]);
    case "canceled_after_24h":
      return weightedValue([
        { value: "opened" as const, weight: 40 },
        { value: "clicked" as const, weight: 25 },
        { value: "delivered" as const, weight: 25 },
        { value: "bounce_risk" as const, weight: 10 },
      ]);
    case "upcoming_pending":
    case "upcoming_due_confirmation":
      return weightedValue([
        { value: "quiet" as const, weight: 38 },
        { value: "opened" as const, weight: 32 },
        { value: "delivered" as const, weight: 20 },
        { value: "failure_risk" as const, weight: 10 },
      ]);
    case "upcoming_due_24h":
    case "upcoming_due_1h":
      return weightedValue([
        { value: "opened" as const, weight: 36 },
        { value: "clicked" as const, weight: 24 },
        { value: "delivered" as const, weight: 24 },
        { value: "bounce_risk" as const, weight: 8 },
        { value: "failure_risk" as const, weight: 8 },
      ]);
    case "upcoming_reschedule_pending":
      return weightedValue([
        { value: "opened" as const, weight: 44 },
        { value: "clicked" as const, weight: 26 },
        { value: "delivered" as const, weight: 20 },
        { value: "quiet" as const, weight: 10 },
      ]);
    case "completed_optout":
    case "upcoming_optout":
      return "quiet";
  }
}

function pickScenarioStart(timezone: SupportedTimezone, scenario: ScenarioType, now: Date) {
  switch (scenario) {
    case "completed_engaged":
    case "completed_standard":
    case "completed_optout":
      return buildBusinessStart(timezone, now, -35, -1);
    case "no_show_expired":
    case "no_show_confirmed":
      return buildBusinessStart(timezone, now, -21, -1);
    case "canceled_before_24h":
    case "canceled_after_24h":
      return buildBusinessStart(timezone, now, -18, -1);
    case "upcoming_confirmed":
    case "upcoming_pending":
    case "upcoming_optout":
      return buildBusinessStart(timezone, now, 1, 8);
    case "upcoming_due_confirmation":
      return buildBusinessStart(timezone, now, 2, 6);
    case "upcoming_reschedule_pending":
      return buildBusinessStart(timezone, now, 2, 5);
    case "upcoming_due_24h":
      return addMinutes(now, faker.number.int({ min: 20 * 60, max: 23 * 60 + 30 }));
    case "upcoming_due_1h":
      return addMinutes(now, faker.number.int({ min: 35, max: 70 }));
  }
}

function randomDateBetween(start: Date, end: Date) {
  if (end.getTime() <= start.getTime()) {
    return new Date(start);
  }

  return new Date(
    start.getTime() +
      faker.number.int({
        min: 0,
        max: end.getTime() - start.getTime(),
      }),
  );
}

function pickConfirmationTime(createdAt: Date, startsAtUtc: Date) {
  const earliest = addMinutes(createdAt, 20);
  const latest = addHours(startsAtUtc, -2);
  return randomDateBetween(earliest, latest.getTime() > earliest.getTime() ? latest : addHours(earliest, 4));
}

function buildConfirmationState(
  confirmationStatus: ConfirmationStatus,
  engagement: EngagementProfile,
): EventState {
  if (confirmationStatus === "skipped") {
    return "skipped_optout";
  }

  if (confirmationStatus === "confirmed") {
    return "clicked";
  }

  if (confirmationStatus === "expired") {
    if (engagement === "failure_risk") {
      return "failed";
    }
    if (engagement === "opened" || engagement === "clicked") {
      return "opened";
    }
    return "delivered";
  }

  if (engagement === "failure_risk") {
    return "failed";
  }
  if (engagement === "opened") {
    return "opened";
  }
  if (engagement === "delivered") {
    return "delivered";
  }
  return "delivered";
}

function buildReminderState(
  engagement: EngagementProfile,
  fallback: EventState = "delivered",
): EventState {
  switch (engagement) {
    case "clicked":
      return "clicked";
    case "opened":
      return "opened";
    case "delivered":
      return "delivered";
    case "bounce_risk":
      return "bounced";
    case "failure_risk":
      return "failed";
    case "quiet":
      return fallback;
  }
}

function buildLifecycle(spec: AppointmentSeedSpec, now: Date): Lifecycle {
  const confirmationRequestedAt = addMinutes(
    spec.createdAt,
    faker.number.int({ min: 1, max: 7 }),
  );
  const reminder24At = addHours(spec.startsAtUtc, -24);
  const reminder1At = addHours(spec.startsAtUtc, -1);
  const rescheduleRequests: RescheduleHistorySpec[] = [];
  let status: AppointmentStatus;
  let confirmationStatus: ConfirmationStatus;
  let confirmUsedAt: Date | undefined;
  let rescheduleUsedAt: Date | undefined;
  let cancellationAt: Date | undefined;
  let confirmationState: EventState;
  let reminder24State: EventState;
  let reminder1State: EventState;

  switch (spec.scenario) {
    case "completed_engaged":
      status = "completed";
      confirmationStatus = spec.emailOptOut ? "skipped" : "confirmed";
      confirmUsedAt = confirmationStatus === "confirmed" ? pickConfirmationTime(spec.createdAt, spec.startsAtUtc) : undefined;
      confirmationState = spec.emailOptOut ? "skipped_optout" : "clicked";
      reminder24State = spec.emailOptOut ? "skipped_optout" : buildReminderState(spec.engagement, "opened");
      reminder1State = spec.emailOptOut ? "skipped_optout" : buildReminderState(spec.engagement, "opened");
      break;
    case "completed_standard":
      status = "completed";
      confirmationStatus = "confirmed";
      confirmUsedAt = pickConfirmationTime(spec.createdAt, spec.startsAtUtc);
      confirmationState = "clicked";
      reminder24State = buildReminderState(spec.engagement, "delivered");
      reminder1State = buildReminderState(spec.engagement, "sent");
      break;
    case "completed_optout":
      status = "completed";
      confirmationStatus = "skipped";
      confirmationState = "skipped_optout";
      reminder24State = "skipped_optout";
      reminder1State = "skipped_optout";
      break;
    case "no_show_expired":
      status = "no_show";
      confirmationStatus = "expired";
      confirmationState = buildConfirmationState(confirmationStatus, spec.engagement);
      reminder24State = buildReminderState(spec.engagement, "delivered");
      reminder1State = buildReminderState(spec.engagement, "delivered");
      break;
    case "no_show_confirmed":
      status = "no_show";
      confirmationStatus = "confirmed";
      confirmUsedAt = pickConfirmationTime(spec.createdAt, spec.startsAtUtc);
      confirmationState = "clicked";
      reminder24State = buildReminderState(spec.engagement, "opened");
      reminder1State = buildReminderState(spec.engagement, "delivered");
      break;
    case "canceled_before_24h":
      status = "canceled";
      confirmationStatus = weightedValue([
        { value: "pending" as const, weight: 60 },
        { value: "confirmed" as const, weight: 40 },
      ]);
      confirmUsedAt =
        confirmationStatus === "confirmed" ? pickConfirmationTime(spec.createdAt, spec.startsAtUtc) : undefined;
      cancellationAt = randomDateBetween(addHours(spec.createdAt, 8), addHours(spec.startsAtUtc, -30));
      confirmationState = confirmationStatus === "confirmed" ? "clicked" : buildConfirmationState(confirmationStatus, spec.engagement);
      reminder24State = "canceled";
      reminder1State = "canceled";
      break;
    case "canceled_after_24h":
      status = "canceled";
      confirmationStatus = weightedValue([
        { value: "confirmed" as const, weight: 70 },
        { value: "pending" as const, weight: 30 },
      ]);
      confirmUsedAt =
        confirmationStatus === "confirmed" ? pickConfirmationTime(spec.createdAt, spec.startsAtUtc) : undefined;
      cancellationAt = randomDateBetween(addHours(spec.startsAtUtc, -8), addHours(spec.startsAtUtc, -2));
      confirmationState = confirmationStatus === "confirmed" ? "clicked" : buildConfirmationState(confirmationStatus, spec.engagement);
      reminder24State = buildReminderState(spec.engagement, "delivered");
      reminder1State = "canceled";
      break;
    case "upcoming_confirmed":
      status = "confirmed";
      confirmationStatus = spec.emailOptOut ? "skipped" : "confirmed";
      confirmUsedAt = confirmationStatus === "confirmed" ? pickConfirmationTime(spec.createdAt, spec.startsAtUtc) : undefined;
      confirmationState = spec.emailOptOut ? "skipped_optout" : "clicked";
      reminder24State = reminder24At.getTime() <= now.getTime() ? buildReminderState(spec.engagement, "delivered") : "pending";
      reminder1State = "pending";
      break;
    case "upcoming_pending":
      status = "scheduled";
      confirmationStatus = spec.emailOptOut ? "skipped" : "pending";
      confirmationState = spec.emailOptOut ? "skipped_optout" : buildConfirmationState(confirmationStatus, spec.engagement);
      reminder24State = "pending";
      reminder1State = "pending";
      break;
    case "upcoming_due_confirmation":
      status = "scheduled";
      confirmationStatus = "pending";
      confirmationState = "pending_due";
      reminder24State = reminder24At.getTime() <= now.getTime() ? "pending_due" : "pending";
      reminder1State = "pending";
      break;
    case "upcoming_due_24h":
      status = "confirmed";
      confirmationStatus = "confirmed";
      confirmUsedAt = pickConfirmationTime(spec.createdAt, spec.startsAtUtc);
      confirmationState = "clicked";
      reminder24State = "pending_due";
      reminder1State = "pending";
      break;
    case "upcoming_due_1h":
      status = "confirmed";
      confirmationStatus = "confirmed";
      confirmUsedAt = pickConfirmationTime(spec.createdAt, spec.startsAtUtc);
      confirmationState = "clicked";
      reminder24State =
        reminder24At.getTime() <= spec.createdAt.getTime()
          ? "skipped_late"
          : reminder24At.getTime() <= now.getTime()
            ? buildReminderState(spec.engagement, "delivered")
            : "pending";
      reminder1State = "pending_due";
      break;
    case "upcoming_reschedule_pending": {
      status = "reschedule_requested";
      confirmationStatus = "pending";
      const requestCreatedAt = randomDateBetween(addHours(spec.createdAt, 6), addHours(now, -2));
      const preferredStartAtUtc = addHours(spec.startsAtUtc, faker.number.int({ min: 6, max: 48 }));

      rescheduleRequests.push({
        status: "pending",
        createdAt: requestCreatedAt,
        preferredStartAtUtc,
        preferredTimezone: spec.timezone,
        message: faker.helpers.arrayElement([
          "Need to move this after a staff handover.",
          "Client requested a later slot because of travel timing.",
          "They can make the appointment, just not at the current time.",
        ]),
      });
      rescheduleUsedAt = requestCreatedAt;
      confirmationState = buildConfirmationState(confirmationStatus, spec.engagement);
      reminder24State = "canceled";
      reminder1State = "canceled";
      break;
    }
    case "upcoming_optout":
      status = "scheduled";
      confirmationStatus = "skipped";
      confirmationState = "skipped_optout";
      reminder24State = "skipped_optout";
      reminder1State = "skipped_optout";
      break;
  }

  if (spec.addAcceptedRescheduleHistory) {
    const createdAt = randomDateBetween(addDays(spec.createdAt, 1), addDays(spec.startsAtUtc, -3));
    const reviewedAt = addHours(createdAt, faker.number.int({ min: 1, max: 6 }));

    rescheduleRequests.push({
      status: "accepted",
      createdAt,
      preferredStartAtUtc: addHours(spec.startsAtUtc, faker.number.int({ min: -6, max: 18 })),
      preferredTimezone: spec.timezone,
      message: "Client accepted a revised time after a schedule clash.",
      reviewedAt,
      reviewedBy: faker.helpers.arrayElement(["Ariana Miles", "Jordan Patel", "Riley Carter"]),
    });
  }

  if (spec.addDismissedRescheduleHistory) {
    const createdAt = randomDateBetween(addDays(spec.createdAt, 1), addDays(spec.startsAtUtc, -2));
    const reviewedAt = addHours(createdAt, faker.number.int({ min: 2, max: 18 }));

    rescheduleRequests.push({
      status: "dismissed",
      createdAt,
      preferredStartAtUtc: addHours(spec.startsAtUtc, faker.number.int({ min: 2, max: 12 })),
      preferredTimezone: spec.timezone,
      message: "Requested slot conflicted with practitioner availability.",
      reviewedAt,
      reviewedBy: faker.helpers.arrayElement(["Ariana Miles", "Jordan Patel", "Riley Carter"]),
    });
  }

  const eventSpecs: EventSpec[] = [
    {
      ruleName: "Immediate confirmation request",
      eventType: "confirmation_request",
      scheduledForUtc: confirmationRequestedAt,
      state: confirmationState,
      reasonAt: confirmUsedAt ?? rescheduleUsedAt ?? cancellationAt ?? null,
    },
    {
      ruleName: "24 hour reminder",
      eventType: "reminder",
      scheduledForUtc: reminder24At,
      state: reminder24State,
      reasonAt: cancellationAt ?? rescheduleUsedAt ?? null,
    },
    {
      ruleName: "1 hour reminder",
      eventType: "reminder",
      scheduledForUtc: reminder1At,
      state: reminder1State,
      reasonAt: cancellationAt ?? rescheduleUsedAt ?? null,
    },
  ];

  return {
    status,
    confirmationStatus,
    confirmUsedAt,
    rescheduleUsedAt,
    cancellationAt,
    eventSpecs,
    rescheduleRequests,
  };
}

function buildErrorMessage(state: EventState) {
  switch (state) {
    case "bounced":
      return "Mailbox provider reported a hard bounce for this recipient.";
    case "failed":
      return "Remote provider timed out while accepting the message.";
    case "canceled":
      return "Reminder plan was canceled after the appointment status changed.";
    case "skipped_optout":
      return "Contact opted out of email reminders.";
    case "skipped_late":
      return "The scheduled send time had already passed when the plan was generated.";
    default:
      return null;
  }
}

function buildSeedRescheduleTriageSnapshot(input: {
  appointmentTitle: string;
  appointmentStartsAtUtc: Date;
  request: RescheduleHistorySpec;
}): SeedRescheduleTriageSnapshot | null {
  const message = input.request.message.trim().toLowerCase();
  const hoursUntilAppointment = Number(
    ((input.appointmentStartsAtUtc.getTime() - input.request.createdAt.getTime()) / (60 * 60 * 1000)).toFixed(1),
  );
  const generatedAt = addMinutes(input.request.createdAt, faker.number.int({ min: 2, max: 6 }));

  const baseTriage: RescheduleTriage = {
    urgency: hoursUntilAppointment <= 12 ? "high" : "medium",
    likelyReasonCategory: "schedule_conflict",
    confidence: "high",
    recommendedAction: "offer_alternatives",
    needsHumanFollowUp: false,
    operationalRisk: hoursUntilAppointment <= 12 ? "urgent" : "watch",
    adminSummary: `Routine reschedule request for ${input.appointmentTitle}. Review the requested time and offer the closest available alternative if needed.`,
    suggestedReply:
      "Thanks for the update. We received your request and will review the preferred time. If that slot is not available, we will send the closest alternative options.",
    riskFlags: ["time change requested"],
  };

  if (message.includes("travel")) {
    baseTriage.likelyReasonCategory = "transportation";
    baseTriage.riskFlags = ["travel timing"];
  } else if (message.includes("handover") || message.includes("staff")) {
    baseTriage.likelyReasonCategory = "work_conflict";
    baseTriage.riskFlags = ["schedule handover"];
  } else if (message.includes("practitioner availability")) {
    baseTriage.likelyReasonCategory = "needs_more_information";
    baseTriage.recommendedAction = "dismiss_request";
    baseTriage.needsHumanFollowUp = true;
    baseTriage.operationalRisk = "watch";
    baseTriage.adminSummary = `Rejected reschedule attempt for ${input.appointmentTitle}. The requested slot conflicted with practitioner availability.`;
    baseTriage.suggestedReply =
      "Thanks for the request. That specific time was not available, so the team closed this request and will follow up with alternatives if needed.";
    baseTriage.riskFlags = ["slot conflict"];
  }

  if (input.request.status === "accepted") {
    baseTriage.recommendedAction = "accept_requested_time";
    baseTriage.operationalRisk = "none";
    baseTriage.adminSummary = `Accepted reschedule for ${input.appointmentTitle}. The new time was clear and the schedule was updated.`;
    baseTriage.suggestedReply =
      "Thanks for the update. Your requested change was accepted and the appointment schedule was updated.";
    baseTriage.riskFlags = ["time change completed"];
  } else if (input.request.status === "dismissed") {
    baseTriage.recommendedAction = "dismiss_request";
    baseTriage.needsHumanFollowUp = true;
  }

  return {
    provider: "gemini",
    model: "gemini-2.5-flash",
    generatedAt,
    triage: baseTriage,
  };
}

function buildProcessedAt(
  scheduledForUtc: Date,
  state: EventState,
  reasonAt?: Date | null,
) {
  switch (state) {
    case "pending":
    case "pending_due":
      return null;
    case "canceled":
      return reasonAt ?? addMinutes(scheduledForUtc, 1);
    case "skipped_optout":
    case "skipped_late":
      return reasonAt ?? addMinutes(scheduledForUtc, 1);
    default:
      return addMinutes(scheduledForUtc, faker.number.int({ min: 2, max: 11 }));
  }
}

function toStoredStatus(state: EventState): ReminderEventStatus {
  if (state === "pending_due") {
    return "pending";
  }

  if (state === "skipped_optout" || state === "skipped_late") {
    return "skipped";
  }

  return state;
}

function isProviderBackedStatus(status: ReminderEventStatus) {
  return ["sent", "delivered", "opened", "clicked", "bounced", "failed"].includes(status);
}

function nextProviderMessageId() {
  providerMessageCounter += 1;
  return `demo-msg-${providerMessageCounter.toString().padStart(5, "0")}`;
}

function nextWebhookEventId() {
  webhookCounter += 1;
  return `demo-webhook-${webhookCounter.toString().padStart(5, "0")}`;
}

function createPhoneNumber(timezone: SupportedTimezone) {
  if (timezone === "Europe/London") {
    return faker.helpers.arrayElement([
      `+44 20 ${faker.string.numeric(4)} ${faker.string.numeric(4)}`,
      `+44 7${faker.string.numeric(3)} ${faker.string.numeric(6)}`,
    ]);
  }

  return `+1 ${faker.string.numeric(3)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`;
}

function buildContactAndAppointmentSpec(
  index: number,
  scenario: ScenarioType,
  now: Date,
  overrides: Partial<AppointmentSeedSpec> = {},
): AppointmentSeedSpec {
  const timezone =
    overrides.timezone ??
    (scenario === "upcoming_due_24h"
      ? pickTimezoneForRelativeBusinessWindow(now, (localHour) => localHour >= 8 && localHour <= 17)
      : scenario === "upcoming_due_1h"
        ? pickTimezoneForRelativeBusinessWindow(now, (localHour) => localHour >= 7 && localHour <= 16)
        : pickTimezone());

  const startsAtUtc = overrides.startsAtUtc ?? pickScenarioStart(timezone, scenario, now);
  const durationMinutes = overrides.durationMinutes ?? pickDurationMinutes(scenario);
  const createdAt =
    overrides.createdAt ??
    addHours(startsAtUtc, -pickLeadHours(scenario));
  const engagement = overrides.engagement ?? pickEngagement(scenario);
  const config =
    supportedTimezones.find((item) => item.timezone === timezone) ?? supportedTimezones[0];
  const fullName = overrides.fullName ?? faker.person.fullName();
  const email =
    overrides.email ??
    `${normalizeNameForEmail(fullName)}.${index + 1}@${faker.helpers.arrayElement(config.domains)}`;
  const externalReference = overrides.externalReference ?? `ARS-${String(index + 1).padStart(4, "0")}`;

  return {
    scenario,
    timezone,
    startsAtUtc,
    durationMinutes,
    createdAt,
    title: overrides.title ?? weightedValue(appointmentTitles),
    locationName: overrides.locationName ?? faker.helpers.arrayElement(config.locations),
    fullName,
    email,
    phone: overrides.phone ?? createPhoneNumber(timezone),
    emailOptOut: overrides.emailOptOut ?? (scenario === "completed_optout" || scenario === "upcoming_optout"),
    engagement,
    externalReference,
    note: overrides.note,
    addAcceptedRescheduleHistory: overrides.addAcceptedRescheduleHistory ?? false,
    addDismissedRescheduleHistory: overrides.addDismissedRescheduleHistory ?? false,
  };
}

function createHeroSpecs(now: Date) {
  const londonTodayLater = addHours(now, 6);
  const londonDueSoon = addMinutes(now, 50);
  const londonTomorrow = addHours(now, 22);

  return [
    buildContactAndAppointmentSpec(0, "upcoming_confirmed", now, {
      fullName: "Marcus Reed",
      email: "marcus.reed@oakwellpractice.co.uk",
      timezone: "Europe/London",
      startsAtUtc: londonTodayLater,
      createdAt: addDays(londonTodayLater, -5),
      title: "Progress Review",
      locationName: "Canary Wharf Office",
      externalReference: "ARS-DEMO-1001",
      addAcceptedRescheduleHistory: true,
      note: "Today later confirmed appointment.",
    }),
    buildContactAndAppointmentSpec(1, "upcoming_due_24h", now, {
      fullName: "Olivia Parker",
      email: "olivia.parker@oakwellpractice.co.uk",
      timezone: "Europe/London",
      startsAtUtc: londonTomorrow,
      createdAt: addDays(londonTomorrow, -7),
      title: "Treatment Plan Follow-up",
      locationName: "Telehealth Room",
      externalReference: "ARS-DEMO-1002",
      note: "24-hour reminder is due right now.",
    }),
    buildContactAndAppointmentSpec(2, "upcoming_reschedule_pending", now, {
      fullName: "Priya Nwosu",
      email: "priya.nwosu@citybridgecare.co.uk",
      timezone: "Europe/London",
      startsAtUtc: buildBusinessStart("Europe/London", now, 3, 4),
      createdAt: addDays(now, -3),
      title: "Care Coordination Session",
      locationName: "Marylebone Practice",
      externalReference: "ARS-DEMO-1003",
      note: "Pending reschedule request for the inbox.",
    }),
    buildContactAndAppointmentSpec(3, "upcoming_confirmed", now, {
      fullName: "Chloe Bennett",
      email: "chloe.bennett@riverfrontclinic.ca",
      timezone: "America/Toronto",
      startsAtUtc: buildBusinessStart("America/Toronto", now, 4, 5),
      createdAt: addDays(now, -6),
      title: "Return Client Consultation",
      locationName: "Downtown Clinic",
      externalReference: "ARS-DEMO-1004",
      addAcceptedRescheduleHistory: true,
    }),
    buildContactAndAppointmentSpec(4, "upcoming_optout", now, {
      fullName: "Naomi Grant",
      email: "naomi.grant@brightpathcare.com",
      timezone: "America/New_York",
      startsAtUtc: buildBusinessStart("America/New_York", now, 4, 6),
      createdAt: addDays(now, -1),
      title: "Virtual Check-in",
      locationName: "Virtual Session",
      externalReference: "ARS-DEMO-1005",
      note: "Email opt-out example.",
    }),
    buildContactAndAppointmentSpec(5, "upcoming_due_1h", now, {
      fullName: "Ethan Cole",
      email: "ethan.cole@citybridgecare.co.uk",
      timezone: "Europe/London",
      startsAtUtc: londonDueSoon,
      createdAt: addDays(now, -2),
      title: "Initial Consultation",
      locationName: "Canary Wharf Office",
      externalReference: "ARS-DEMO-1006",
      note: "1-hour reminder is due right now.",
    }),
    buildContactAndAppointmentSpec(6, "no_show_expired", now, {
      fullName: "Lena Hoffman",
      email: "lena.hoffman@brightpathcare.com",
      timezone: "America/New_York",
      startsAtUtc: buildBusinessStart("America/New_York", now, -1, -1),
      title: "Therapy Session",
      locationName: "Harbor View Office",
      externalReference: "ARS-DEMO-1007",
    }),
    buildContactAndAppointmentSpec(7, "canceled_after_24h", now, {
      fullName: "Sofia Khan",
      email: "sofia.khan@riverfrontclinic.ca",
      timezone: "America/Toronto",
      startsAtUtc: buildBusinessStart("America/Toronto", now, -2, -2),
      title: "Annual Wellness Review",
      locationName: "Downtown Clinic",
      externalReference: "ARS-DEMO-1008",
    }),
    buildContactAndAppointmentSpec(8, "completed_engaged", now, {
      fullName: "Harper Wells",
      email: "harper.wells@oakwellpractice.co.uk",
      timezone: "Europe/London",
      startsAtUtc: buildBusinessStart("Europe/London", now, -5, -5),
      title: "Progress Review",
      locationName: "Marylebone Practice",
      externalReference: "ARS-DEMO-1009",
    }),
    buildContactAndAppointmentSpec(9, "completed_standard", now, {
      fullName: "Daniel Brooks",
      email: "daniel.brooks@lakesidepractice.com",
      timezone: "America/Chicago",
      startsAtUtc: buildBusinessStart("America/Chicago", now, -9, -9),
      title: "Care Coordination Session",
      locationName: "Loop Office",
      externalReference: "ARS-DEMO-1010",
      addDismissedRescheduleHistory: true,
    }),
    buildContactAndAppointmentSpec(10, "no_show_confirmed", now, {
      fullName: "Mia Johnson",
      email: "mia.johnson@sunsetwellness.com",
      timezone: "America/Los_Angeles",
      startsAtUtc: buildBusinessStart("America/Los_Angeles", now, -12, -12),
      title: "Treatment Plan Follow-up",
      locationName: "Westside Practice",
      externalReference: "ARS-DEMO-1011",
    }),
    buildContactAndAppointmentSpec(11, "canceled_before_24h", now, {
      fullName: "Audrey Price",
      email: "audrey.price@brightpathcare.com",
      timezone: "America/New_York",
      startsAtUtc: buildBusinessStart("America/New_York", now, -7, -7),
      title: "Initial Consultation",
      locationName: "Midtown Clinic",
      externalReference: "ARS-DEMO-1012",
    }),
    buildContactAndAppointmentSpec(12, "upcoming_due_confirmation", now, {
      fullName: "Victor Shaw",
      email: "victor.shaw@northloopcare.com",
      timezone: "America/Chicago",
      startsAtUtc: buildBusinessStart("America/Chicago", now, 4, 4),
      createdAt: addHours(now, -8),
      title: "Return Client Consultation",
      locationName: "Secure Video Room",
      externalReference: "ARS-DEMO-1013",
      note: "Confirmation request is due right now.",
    }),
    buildContactAndAppointmentSpec(13, "upcoming_pending", now, {
      fullName: "Grace Turner",
      email: "grace.turner@citybridgecare.co.uk",
      timezone: "Europe/London",
      startsAtUtc: buildBusinessStart("Europe/London", now, 2, 2),
      createdAt: addHours(now, -15),
      title: "Virtual Check-in",
      locationName: "Telehealth Room",
      externalReference: "ARS-DEMO-1014",
      note: "Pending confirmation with prior open activity.",
    }),
  ];
}

function createBackgroundSpecs(now: Date, startIndex: number, count: number) {
  const specs: AppointmentSeedSpec[] = [];

  for (let index = 0; index < count; index += 1) {
    const scenario = weightedValue(scenarioWeights);
    const spec = buildContactAndAppointmentSpec(startIndex + index, scenario, now, {
      addAcceptedRescheduleHistory:
        scenario === "upcoming_confirmed" && faker.datatype.boolean({ probability: 0.12 }),
      addDismissedRescheduleHistory:
        (scenario === "completed_standard" || scenario === "upcoming_confirmed") &&
        faker.datatype.boolean({ probability: 0.08 }),
    });

    specs.push(spec);
  }

  return specs;
}

async function upsertReminderRules() {
  const records = new Map<ReminderRuleName, RuleRecord>();

  for (const rule of reminderRules) {
    const savedRule = await prisma.reminderRule.upsert({
      where: {
        name: rule.name,
      },
      update: {
        active: true,
        eventType: rule.eventType,
        offsetMinutes: rule.offsetMinutes,
      },
      create: {
        name: rule.name,
        eventType: rule.eventType,
        offsetMinutes: rule.offsetMinutes,
      },
    });

    records.set(rule.name, {
      id: savedRule.id,
    });
  }

  return records;
}

async function clearDemoData() {
  await prisma.$transaction([
    prisma.emailWebhookEvent.deleteMany(),
    prisma.appointmentActionToken.deleteMany(),
    prisma.rescheduleRequest.deleteMany(),
    prisma.reminderEvent.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.contact.deleteMany(),
  ]);
}

async function seedAppointment(
  spec: AppointmentSeedSpec,
  rules: Map<ReminderRuleName, RuleRecord>,
  now: Date,
  sampleLinks: SampleLink[],
) {
  const lifecycle = buildLifecycle(spec, now);
  const endsAtUtc = addMinutes(spec.startsAtUtc, spec.durationMinutes);
  const latestReviewAt = lifecycle.rescheduleRequests.reduce<Date | null>((latest, request) => {
    if (!request.reviewedAt) {
      return latest;
    }

    if (!latest || request.reviewedAt.getTime() > latest.getTime()) {
      return request.reviewedAt;
    }

    return latest;
  }, null);

  const appointmentUpdatedAt =
    latestReviewAt ??
    lifecycle.cancellationAt ??
    lifecycle.rescheduleUsedAt ??
    lifecycle.confirmUsedAt ??
    spec.createdAt;

  const confirmRawToken = `demo-${spec.externalReference.toLowerCase()}-confirm`;
  const rescheduleRawToken = `demo-${spec.externalReference.toLowerCase()}-reschedule`;

  await prisma.$transaction(
    async (transaction) => {
      const contact = await transaction.contact.create({
        data: {
          fullName: spec.fullName,
          email: spec.email,
          phone: spec.phone,
          timezone: spec.timezone,
          emailOptOut: spec.emailOptOut,
          createdAt: spec.createdAt,
          updatedAt: spec.createdAt,
        },
      });

      const appointment = await transaction.appointment.create({
        data: {
          contactId: contact.id,
          title: spec.title,
          locationName: spec.locationName,
          startsAtUtc: spec.startsAtUtc,
          endsAtUtc,
          displayTimezone: spec.timezone,
          status: lifecycle.status,
          confirmationStatus: lifecycle.confirmationStatus,
          externalReference: spec.externalReference,
          createdAt: spec.createdAt,
          updatedAt: appointmentUpdatedAt,
        },
      });

      const tokenExpiry = new Date(
        Math.min(spec.startsAtUtc.getTime(), now.getTime() + 30 * DAY_MS),
      );

      await transaction.appointmentActionToken.create({
        data: {
          appointmentId: appointment.id,
          actionType: "confirm",
          tokenHash: hashActionToken(confirmRawToken),
          expiresAt: tokenExpiry,
          usedAt: lifecycle.confirmUsedAt ?? null,
          createdAt: spec.createdAt,
          updatedAt: lifecycle.confirmUsedAt ?? spec.createdAt,
        },
      });

      await transaction.appointmentActionToken.create({
        data: {
          appointmentId: appointment.id,
          actionType: "reschedule",
          tokenHash: hashActionToken(rescheduleRawToken),
          expiresAt: tokenExpiry,
          usedAt: lifecycle.rescheduleUsedAt ?? null,
          createdAt: spec.createdAt,
          updatedAt: lifecycle.rescheduleUsedAt ?? spec.createdAt,
        },
      });

      if (
        ["scheduled", "confirmed", "reschedule_requested"].includes(lifecycle.status) &&
        tokenExpiry.getTime() > now.getTime()
      ) {
        sampleLinks.push({
          name: spec.fullName,
          externalReference: spec.externalReference,
          confirmUrl: `${publicWebUrl}/confirm/${confirmRawToken}`,
          rescheduleUrl: `${publicWebUrl}/reschedule/${rescheduleRawToken}`,
          note: spec.note,
        });
      }

      for (const request of lifecycle.rescheduleRequests) {
        const triageSnapshot = buildSeedRescheduleTriageSnapshot({
          appointmentTitle: spec.title,
          appointmentStartsAtUtc: spec.startsAtUtc,
          request,
        });

        await transaction.rescheduleRequest.create({
          data: {
            appointmentId: appointment.id,
            preferredStartAtUtc: request.preferredStartAtUtc,
            preferredTimezone: request.preferredTimezone,
            message: request.message,
            aiTriageJson: triageSnapshot?.triage,
            aiTriageProvider: triageSnapshot?.provider ?? null,
            aiTriageModel: triageSnapshot?.model ?? null,
            aiTriageGeneratedAt: triageSnapshot?.generatedAt ?? null,
            status: request.status,
            reviewedAt: request.reviewedAt ?? null,
            reviewedBy: request.reviewedBy ?? null,
            createdAt: request.createdAt,
            updatedAt: request.reviewedAt ?? request.createdAt,
          },
        });
      }

      for (const event of lifecycle.eventSpecs) {
        const rule = rules.get(event.ruleName);

        if (!rule) {
          throw new Error(`Missing reminder rule ${event.ruleName}`);
        }

        const status = toStoredStatus(event.state);
        const processedAt = buildProcessedAt(event.scheduledForUtc, event.state, event.reasonAt);
        const providerMessageId = isProviderBackedStatus(status) ? nextProviderMessageId() : null;
        const reminderEvent = await transaction.reminderEvent.create({
          data: {
            appointmentId: appointment.id,
            ruleId: rule.id,
            channel: "email",
            eventType: event.eventType,
            scheduledForUtc: event.scheduledForUtc,
            status,
            provider: providerMessageId ? "resend" : null,
            providerMessageId,
            processedAt,
            errorMessage: buildErrorMessage(event.state),
            createdAt: spec.createdAt,
            updatedAt: processedAt ?? spec.createdAt,
          },
        });

        if (providerMessageId && processedAt && status !== "sent") {
          await transaction.emailWebhookEvent.create({
            data: {
              provider: "resend",
              providerEventId: nextWebhookEventId(),
              providerMessageId,
              eventType: `email.${status}`,
              payloadJson: {
                reminderEventId: reminderEvent.id,
                appointmentId: appointment.id,
                eventType: reminderEvent.eventType,
                status,
                processedAt: processedAt.toISOString(),
                externalReference: spec.externalReference,
              },
              receivedAt: addMinutes(processedAt, faker.number.int({ min: 1, max: 4 })),
            },
          });
        }
      }
    },
    SEED_TRANSACTION_OPTIONS,
  );
}

async function main() {
  const now = new Date(Math.floor(Date.now() / (15 * MINUTE_MS)) * 15 * MINUTE_MS);

  faker.setDefaultRefDate(now);

  const rules = await upsertReminderRules();
  await clearDemoData();

  const heroSpecs = createHeroSpecs(now);
  const backgroundSpecs = createBackgroundSpecs(now, heroSpecs.length, 96);
  const allSpecs = [...heroSpecs, ...backgroundSpecs].sort(
    (left, right) => left.startsAtUtc.getTime() - right.startsAtUtc.getTime(),
  );
  const sampleLinks: SampleLink[] = [];

  for (const spec of allSpecs) {
    await seedAppointment(spec, rules, now, sampleLinks);
  }

  const [contactCount, appointmentCount, reminderEventCount, rescheduleRequestCount, webhookCount] =
    await Promise.all([
      prisma.contact.count(),
      prisma.appointment.count(),
      prisma.reminderEvent.count(),
      prisma.rescheduleRequest.count(),
      prisma.emailWebhookEvent.count(),
    ]);

  const activeSampleLinks = sampleLinks.slice(0, 6);

  console.log(
    [
      `Seed complete with deterministic Faker data.`,
      `Reference time: ${now.toISOString()}`,
      `Contacts: ${contactCount}`,
      `Appointments: ${appointmentCount}`,
      `Reminder events: ${reminderEventCount}`,
      `Reschedule requests: ${rescheduleRequestCount}`,
      `Webhook events: ${webhookCount}`,
      `Sample public links:`,
      ...activeSampleLinks.map(
        (sample) =>
          `- ${sample.externalReference} ${sample.name}: confirm=${sample.confirmUrl} reschedule=${sample.rescheduleUrl}${sample.note ? ` (${sample.note})` : ""}`,
      ),
    ].join("\n"),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
