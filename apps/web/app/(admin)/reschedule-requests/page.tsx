import { CalendarClock } from "lucide-react"

import { ReviewActions } from "@/app/(admin)/reschedule-requests/_components/review-actions"
import { TriagePanel } from "@/app/(admin)/reschedule-requests/_components/triage-panel"
import { PageHeading } from "@/components/admin/page-heading"
import { fetchRescheduleRequests } from "@/lib/api"
import { formatAppointmentDate } from "@/lib/format"

export default async function RescheduleRequestsPage() {
  const requests = await fetchRescheduleRequests()

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Reschedule Workflow"
        title="Reschedule Requests"
        description="Review pending client requests and reissue a fresh reminder plan after you accept or dismiss them."
      />

      <section className="surface-panel overflow-hidden">
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-muted/70">
                <tr>
                  {[
                    "Client",
                    "Original Time",
                    "Preferred Time",
                    "Message",
                    "Action",
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-5 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="px-5 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    AI Triage
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-border/70 transition-colors hover:bg-accent/35"
                  >
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {request.appointment.contact.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.appointment.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {formatAppointmentDate(
                        request.appointment.startsAtUtc,
                        request.appointment.displayTimezone,
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {formatAppointmentDate(
                        request.preferredStartAtUtc,
                        request.preferredTimezone,
                      )}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-sm text-muted-foreground">
                      {request.message ?? "No additional message supplied."}
                    </td>
                    <td className="px-5 py-4">
                      <ReviewActions requestId={request.id} />
                    </td>
                    <td className="min-w-[24rem] px-5 py-4 align-top">
                      <TriagePanel requestId={request.id} initialResult={request.aiTriage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">No open requests</p>
              <p className="max-w-md text-sm text-muted-foreground">
                When clients ask to move their appointments, this inbox will become the team&apos;s operational triage queue.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
