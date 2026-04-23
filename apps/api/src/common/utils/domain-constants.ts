export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "reschedule_requested",
  "canceled",
  "completed",
  "no_show",
] as const;

export const CONFIRMATION_STATUSES = [
  "pending",
  "confirmed",
  "expired",
  "skipped",
] as const;

export const REMINDER_CHANNELS = ["email"] as const;

export const REMINDER_EVENT_TYPES = [
  "confirmation_request",
  "reminder",
  "follow_up",
] as const;

export const REMINDER_EVENT_STATUSES = [
  "pending",
  "locked",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "failed",
  "canceled",
  "skipped",
] as const;

export const APPOINTMENT_ACTION_TYPES = ["confirm", "reschedule"] as const;

export const RESCHEDULE_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "dismissed",
] as const;
