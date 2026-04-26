import { PublicAppointmentSummary } from "@/app/(public)/_components/public-appointment-summary"
import { PublicErrorState } from "@/app/(public)/_components/public-error-state"
import { RescheduleRequestPanel } from "@/app/(public)/reschedule/[token]/_components/reschedule-request-panel"
import { fetchReschedulePreview } from "@/lib/api"

export default async function RescheduleAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const preview = await fetchReschedulePreview(token).catch((error) => {
    if (error instanceof Error) {
      return error
    }

    return new Error("The reschedule link is unavailable right now.")
  })

  if (preview instanceof Error) {
    return (
      <PublicErrorState
        title="This reschedule link cannot be used"
        message={preview.message}
      />
    )
  }

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <RescheduleRequestPanel token={token} preview={preview} />
      <PublicAppointmentSummary
        appointment={preview.appointment}
        expiresAt={preview.expiresAt}
      />
    </div>
  )
}
