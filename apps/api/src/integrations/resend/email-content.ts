import type { ReminderEventType } from "../../generated/prisma/client.js";

export type AppointmentEmailContentInput = {
  eventType: ReminderEventType;
  appointmentTitle: string;
  startsAtUtc: Date;
  displayTimezone: string;
  contactName: string;
  locationName?: string | null;
  confirmUrl: string;
  rescheduleUrl: string;
};

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function formatAppointmentDate(startsAtUtc: Date, displayTimezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: displayTimezone,
  }).format(startsAtUtc);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAppointmentEmailContent(input: AppointmentEmailContentInput): EmailContent {
  const appointmentDate = formatAppointmentDate(input.startsAtUtc, input.displayTimezone);
  const escapedTitle = escapeHtml(input.appointmentTitle);
  const escapedContactName = escapeHtml(input.contactName);
  const escapedDate = escapeHtml(appointmentDate);
  const escapedTimezone = escapeHtml(input.displayTimezone);
  const escapedLocation = input.locationName ? escapeHtml(input.locationName) : null;

  const baseSummary = [
    `Appointment: ${input.appointmentTitle}`,
    `When: ${appointmentDate} (${input.displayTimezone})`,
    ...(input.locationName ? [`Location: ${input.locationName}`] : []),
  ].join("\n");

  const intro =
    input.eventType === "confirmation_request"
      ? `Please confirm your upcoming appointment for ${input.appointmentTitle}.`
      : input.eventType === "follow_up"
        ? `Following up on your recent appointment for ${input.appointmentTitle}.`
        : `This is a reminder for your upcoming appointment for ${input.appointmentTitle}.`;

  const subjectPrefix =
    input.eventType === "confirmation_request"
      ? "Please confirm"
      : input.eventType === "follow_up"
        ? "Follow-up"
        : "Reminder";

  return {
    subject: `${subjectPrefix}: ${input.appointmentTitle} on ${appointmentDate}`,
    text: [
      `Hi ${input.contactName},`,
      "",
      intro,
      "",
      baseSummary,
      "",
      `Confirm attendance: ${input.confirmUrl}`,
      `Request a reschedule: ${input.rescheduleUrl}`,
    ].join("\n"),
    html: [
      "<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;\">",
      `<p>Hi ${escapedContactName},</p>`,
      `<p>${escapeHtml(intro)}</p>`,
      "<div style=\"padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;\">",
      `<p style=\"margin:0 0 8px;\"><strong>Appointment</strong><br />${escapedTitle}</p>`,
      `<p style=\"margin:0 0 8px;\"><strong>When</strong><br />${escapedDate} (${escapedTimezone})</p>`,
      ...(escapedLocation
        ? [`<p style=\"margin:0;\"><strong>Location</strong><br />${escapedLocation}</p>`]
        : ["<p style=\"margin:0;\"><strong>Location</strong><br />To be confirmed</p>"]),
      "</div>",
      "<p style=\"margin:24px 0 12px;\">Use one of the links below:</p>",
      `<p style=\"margin:0 0 12px;\"><a href=\"${escapeHtml(input.confirmUrl)}\" style=\"display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;\">Confirm attendance</a></p>`,
      `<p style=\"margin:0 0 24px;\"><a href=\"${escapeHtml(input.rescheduleUrl)}\" style=\"display:inline-block;padding:12px 18px;border-radius:999px;border:1px solid #111827;color:#111827;text-decoration:none;font-weight:600;\">Request a reschedule</a></p>`,
      "<p style=\"color:#4b5563;font-size:14px;\">These links expire automatically for security.</p>",
      "</div>",
    ].join(""),
  };
}
