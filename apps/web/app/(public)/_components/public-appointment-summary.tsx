import type { ReactNode } from "react"
import { CalendarDays, Clock3, Mail, UserRound } from "lucide-react"

import { ConfirmationBadge } from "@/components/admin/confirmation-badge"
import { StatusBadge } from "@/components/admin/status-badge"
import type { ActionAppointmentPreview } from "@/lib/api"
import { formatAppointmentDate } from "@/lib/format"

type PublicAppointmentSummaryProps = {
  appointment: ActionAppointmentPreview
  expiresAt?: string
}

function PublicAppointmentSummary({
  appointment,
  expiresAt,
}: PublicAppointmentSummaryProps) {
  return (
    <aside className="surface-panel p-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusBadge status={appointment.status} />
        <ConfirmationBadge confirmationStatus={appointment.confirmationStatus} />
      </div>

      <div className="space-y-2">
        <p className="text-micro">Appointment Snapshot</p>
        <h2 className="text-2xl font-bold text-foreground">{appointment.title}</h2>
        <p className="text-sm text-muted-foreground">
          Sent to {appointment.contact.fullName}. The action below updates the live appointment
          record in the operations dashboard.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <DetailRow
          icon={<CalendarDays className="h-4 w-4 text-secondary" />}
          label="Scheduled For"
          value={formatAppointmentDate(appointment.startsAtUtc, appointment.displayTimezone)}
        />
        <DetailRow
          icon={<Clock3 className="h-4 w-4 text-secondary" />}
          label="Timezone"
          value={appointment.displayTimezone}
        />
        <DetailRow
          icon={<UserRound className="h-4 w-4 text-secondary" />}
          label="Client"
          value={`${appointment.contact.fullName} (${appointment.contact.timezone})`}
        />
        <DetailRow
          icon={<Mail className="h-4 w-4 text-secondary" />}
          label="Email"
          value={appointment.contact.email}
        />
      </div>

      {expiresAt ? (
        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/60 px-4 py-3">
          <p className="text-micro">Link Expiry</p>
          <p className="mt-2 text-sm text-foreground">
            This action link expires{" "}
            <span className="font-semibold">
              {formatAppointmentDate(expiresAt, appointment.contact.timezone)}
            </span>
            .
          </p>
        </div>
      ) : null}
    </aside>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="surface-inset flex items-start gap-3 p-4">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-card shadow-sm">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-micro">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export { PublicAppointmentSummary }
