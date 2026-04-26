import Link from "next/link"
import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  MailWarning,
  MessageSquareMore,
  Send,
  ShieldAlert,
} from "lucide-react"

import { DashboardControls } from "@/app/(admin)/dashboard/_components/dashboard-controls"
import { DashboardMetricCard } from "@/app/(admin)/dashboard/_components/dashboard-metric-card"
import { ReminderActivityChart } from "@/app/(admin)/dashboard/_components/reminder-activity-chart"
import { ConfirmationBadge } from "@/components/admin/confirmation-badge"
import { PageHeading } from "@/components/admin/page-heading"
import { StatusBadge } from "@/components/admin/status-badge"
import { fetchAppointments, fetchDashboardSummary } from "@/lib/api"
import { formatAppointmentDate, formatMetricNumber } from "@/lib/format"

export default async function DashboardPage() {
  const [summary, recentConfirmedAppointments] = await Promise.all([
    fetchDashboardSummary(),
    fetchAppointments({
      page: 1,
      pageSize: 5,
      confirmationStatus: "confirmed",
    }),
  ])

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Operations Dashboard"
        title="Command Center"
        description="Track confirmation pressure, reminder delivery, and reschedule risk before they turn into no-shows."
        actions={<DashboardControls />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="Appointments Today"
          value={formatMetricNumber(summary.metrics.appointmentsToday)}
          helper="Live count across the current UTC day window."
          icon={<CalendarCheck2 className="h-5 w-5" />}
        />
        <DashboardMetricCard
          label="Confirmed"
          value={formatMetricNumber(summary.metrics.confirmedAppointments)}
          helper="Clients who already signaled attendance."
          tone="success"
          icon={<Send className="h-5 w-5" />}
        />
        <DashboardMetricCard
          label="Pending Confirmation"
          value={formatMetricNumber(summary.metrics.pendingConfirmations)}
          helper="The first list your admin team needs to chase."
          tone="warning"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <DashboardMetricCard
          label="Reschedule Requests"
          value={formatMetricNumber(summary.metrics.rescheduleRequests)}
          helper="Requests waiting for a staff decision right now."
          tone="danger"
          icon={<MessageSquareMore className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <article className="surface-panel p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-micro">Delivery Reliability</p>
              <h2 className="text-2xl font-bold text-foreground">Reminder Activity</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                Sent
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Failed
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Bounced
              </span>
            </div>
          </div>
          <ReminderActivityChart data={summary.reminderActivity} />
        </article>

        <article className="surface-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-micro">Confirmed Recently</p>
              <h2 className="text-2xl font-bold text-foreground">Signal Feed</h2>
            </div>
            <div className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Live Demo Data
            </div>
          </div>

          <div className="space-y-4">
            {recentConfirmedAppointments.items.length > 0 ? (
              recentConfirmedAppointments.items.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="surface-inset block space-y-3 p-4 transition-colors hover:bg-accent/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {appointment.contact.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">{appointment.title}</p>
                    </div>
                    <ConfirmationBadge confirmationStatus={appointment.confirmationStatus} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatAppointmentDate(
                        appointment.startsAtUtc,
                        appointment.displayTimezone,
                      )}
                    </span>
                    <span className="text-border">/</span>
                    <StatusBadge status={appointment.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="surface-inset flex min-h-56 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShieldAlert className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">No confirmations yet</p>
                  <p className="text-sm text-muted-foreground">
                    As new reminder emails go out, this feed will show recent client responses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-panel p-5">
          <p className="text-micro">Failure Watch</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {formatMetricNumber(summary.metrics.deliveryFailures)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Delivery failures logged today.
              </p>
            </div>
            <MailWarning className="h-5 w-5 text-rose-500" />
          </div>
        </article>
        <article className="surface-panel p-5">
          <p className="text-micro">Bounce Count</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {formatMetricNumber(summary.metrics.bounceCount)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Addresses that need cleanup before tomorrow&apos;s sends.
              </p>
            </div>
            <CalendarX2 className="h-5 w-5 text-amber-500" />
          </div>
        </article>
        <article className="surface-panel p-5">
          <p className="text-micro">Reminders Sent Today</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {formatMetricNumber(summary.metrics.remindersSentToday)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Successful sends in the active daily window.
              </p>
            </div>
            <Send className="h-5 w-5 text-secondary" />
          </div>
        </article>
      </section>
    </div>
  )
}
