import { ConfirmAppointmentPanel } from "@/app/(public)/confirm/[token]/_components/confirm-appointment-panel"
import { PublicAppointmentSummary } from "@/app/(public)/_components/public-appointment-summary"
import { PublicErrorState } from "@/app/(public)/_components/public-error-state"
import { fetchConfirmPreview } from "@/lib/api"

export default async function ConfirmAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const preview = await fetchConfirmPreview(token).catch((error) => {
    if (error instanceof Error) {
      return error
    }

    return new Error("The confirmation link is unavailable right now.")
  })

  if (preview instanceof Error) {
    return (
      <PublicErrorState
        title="This confirmation link cannot be used"
        message={preview.message}
      />
    )
  }

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <ConfirmAppointmentPanel token={token} preview={preview} />
      <PublicAppointmentSummary
        appointment={preview.appointment}
        expiresAt={preview.expiresAt}
      />
    </div>
  )
}
