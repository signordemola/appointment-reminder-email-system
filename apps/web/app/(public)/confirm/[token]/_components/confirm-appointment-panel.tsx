"use client"

import { useMutation } from "@tanstack/react-query"
import { CheckCheck, LoaderCircle, ShieldCheck } from "lucide-react"

import type { ActionPreview } from "@/lib/api"
import { confirmAppointmentByToken } from "@/lib/api"
import { formatAppointmentDate } from "@/lib/format"

type ConfirmAppointmentPanelProps = {
  token: string
  preview: ActionPreview
}

function ConfirmAppointmentPanel({
  token,
  preview,
}: ConfirmAppointmentPanelProps) {
  const mutation = useMutation({
    mutationFn: () => confirmAppointmentByToken(token),
  })

  if (mutation.isSuccess) {
    return (
      <section className="surface-panel overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-secondary" />
        <div className="space-y-6 p-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
            <CheckCheck className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-micro">Attendance Locked In</p>
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground">
              Appointment Confirmed
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              You are confirmed for{" "}
              <span className="font-semibold text-foreground">
                {formatAppointmentDate(
                  preview.appointment.startsAtUtc,
                  preview.appointment.displayTimezone,
                )}
              </span>
              . The operations team will keep the reminder schedule active from here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Confirmed At"
              value={formatAppointmentDate(
                mutation.data.confirmedAt,
                preview.appointment.contact.timezone,
              )}
            />
            <MetricCard
              label="Client"
              value={preview.appointment.contact.fullName}
            />
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800">
            If your plans change later, use the reschedule link from the original reminder email so
            the team can review a new time.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="surface-panel overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-secondary via-sky-500 to-emerald-500" />
      <div className="space-y-8 p-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/12 text-secondary">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="space-y-3">
          <p className="text-micro">One-Tap Confirmation</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground">
            Confirm Your Appointment
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Confirming here immediately updates the live appointment status, stops additional
            confirmation-chase messages, and gives the operations team a reliable attendance signal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Client"
            value={preview.appointment.contact.fullName}
          />
          <MetricCard
            label="Scheduled For"
            value={formatAppointmentDate(
              preview.appointment.startsAtUtc,
              preview.appointment.displayTimezone,
            )}
          />
        </div>

        {mutation.error ? (
          <div className="rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Unable to confirm this appointment right now."}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {mutation.isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Appointment
          </button>
          <p className="text-sm text-muted-foreground">
            This link stays active until the listed expiry time or until it is used.
          </p>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-muted/60 px-5 py-4">
      <p className="text-micro">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export { ConfirmAppointmentPanel }
