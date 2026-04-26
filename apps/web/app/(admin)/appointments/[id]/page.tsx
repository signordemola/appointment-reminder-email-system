import { notFound } from "next/navigation"
import { ArrowLeft, CalendarRange, Clock3, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

import { ConfirmationBadge } from "@/components/admin/confirmation-badge"
import { PageHeading } from "@/components/admin/page-heading"
import { StatusBadge } from "@/components/admin/status-badge"
import { fetchAppointment } from "@/lib/api"
import { formatAppointmentDate, formatRelativeSchedule } from "@/lib/format"

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const appointment = await fetchAppointment(id).catch(() => null)

  if (!appointment) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/appointments"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to roster
        </Link>
        <span className="text-micro">
          Reference {appointment.externalReference ?? appointment.id.slice(0, 8)}
        </span>
      </div>

      <PageHeading
        eyebrow="Appointment Timeline"
        title={appointment.title}
        description={`Scheduled for ${formatAppointmentDate(
          appointment.startsAtUtc,
          appointment.displayTimezone,
        )}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={appointment.status} />
            <ConfirmationBadge confirmationStatus={appointment.confirmationStatus} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="space-y-6">
          <article className="surface-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <CalendarRange className="h-5 w-5 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Schedule Details</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="surface-inset p-4">
                <p className="text-micro">Starts</p>
                <p className="mt-2 font-semibold text-foreground">
                  {formatAppointmentDate(appointment.startsAtUtc, appointment.displayTimezone)}
                </p>
              </div>
              <div className="surface-inset p-4">
                <p className="text-micro">Ends</p>
                <p className="mt-2 font-semibold text-foreground">
                  {appointment.endsAtUtc
                    ? formatAppointmentDate(appointment.endsAtUtc, appointment.displayTimezone)
                    : "Not specified"}
                </p>
              </div>
              <div className="surface-inset p-4">
                <p className="text-micro">Display Timezone</p>
                <p className="mt-2 font-semibold text-foreground">
                  {appointment.displayTimezone}
                </p>
              </div>
              <div className="surface-inset p-4">
                <p className="text-micro">Location</p>
                <p className="mt-2 font-semibold text-foreground">
                  {appointment.locationName ?? "Location pending"}
                </p>
              </div>
            </div>
          </article>

          <article className="surface-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Primary Contact</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-inset p-4">
                <p className="text-micro">Name</p>
                <p className="mt-2 font-semibold text-foreground">
                  {appointment.contact.fullName}
                </p>
              </div>
              <div className="surface-inset p-4">
                <p className="text-micro">Timezone</p>
                <p className="mt-2 font-semibold text-foreground">
                  {appointment.contact.timezone}
                </p>
              </div>
              <div className="surface-inset p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="mt-2 font-mono text-sm text-foreground">
                  {appointment.contact.email}
                </p>
              </div>
              <div className="surface-inset p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
                <p className="mt-2 font-mono text-sm text-foreground">
                  {appointment.contact.phone ?? "Not supplied"}
                </p>
              </div>
            </div>
          </article>
        </section>

        <aside className="surface-panel p-6">
          <div className="mb-5 flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-bold text-foreground">Reminder Events</h2>
          </div>
          <div className="space-y-4">
            {appointment.reminderEvents.map((event) => (
              <article key={event.id} className="surface-inset p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {event.eventType.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeSchedule(event.scheduledForUtc)}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                    {event.status}
                  </span>
                </div>
                {event.providerMessageId ? (
                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    Provider ID: {event.providerMessageId}
                  </p>
                ) : null}
                {event.errorMessage ? (
                  <p className="mt-3 text-sm text-destructive">{event.errorMessage}</p>
                ) : null}
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
