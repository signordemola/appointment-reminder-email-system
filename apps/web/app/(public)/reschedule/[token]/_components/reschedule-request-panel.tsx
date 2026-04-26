"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { CalendarClock, LoaderCircle, SendHorizontal } from "lucide-react"
import { z } from "zod"

import type { ActionPreview } from "@/lib/api"
import type { CreateRescheduleRequestFromTokenInput } from "@/lib/api"
import { createRescheduleRequestFromToken } from "@/lib/api"
import {
  COMMON_TIMEZONES,
  localDateTimeToUtcIso,
  utcIsoToDateTimeLocalValue,
} from "@/lib/date-time"
import { formatAppointmentDate } from "@/lib/format"

type RescheduleRequestPanelProps = {
  token: string
  preview: ActionPreview
}

type RescheduleFormValues = {
  preferredStartAtLocal: string
  preferredTimezone: string
  message: string
}

function buildRescheduleSchema(currentStartAtUtc: string) {
  return z
    .object({
      preferredStartAtLocal: z.string().min(1, "Pick a new preferred time."),
      preferredTimezone: z.string().min(3, "Choose a timezone."),
      message: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
    })
    .superRefine((values, context) => {
      let nextStartAtUtc: string

      try {
        nextStartAtUtc = localDateTimeToUtcIso(
          values.preferredStartAtLocal,
          values.preferredTimezone,
        )
      } catch (error) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preferredStartAtLocal"],
          message: error instanceof Error ? error.message : "Enter a valid date and time.",
        })
        return
      }

      const nextStartAt = new Date(nextStartAtUtc)
      if (nextStartAt.getTime() <= Date.now()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preferredStartAtLocal"],
          message: "Choose a time in the future.",
        })
      }

      if (nextStartAtUtc === currentStartAtUtc) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preferredStartAtLocal"],
          message: "Pick a time different from the current appointment.",
        })
      }
    })
}

function RescheduleRequestPanel({
  token,
  preview,
}: RescheduleRequestPanelProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const form = useForm<RescheduleFormValues>({
    defaultValues: {
      preferredStartAtLocal: utcIsoToDateTimeLocalValue(
        preview.appointment.startsAtUtc,
        preview.appointment.contact.timezone,
      ),
      preferredTimezone: preview.appointment.contact.timezone,
      message: "",
    },
  })

  const mutation = useMutation({
    mutationFn: ({
      token: rawToken,
      input,
    }: {
      token: string
      input: CreateRescheduleRequestFromTokenInput
    }) => createRescheduleRequestFromToken(rawToken, input),
    onError: (error) => {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit the reschedule request.",
      )
    },
  })

  const timeZoneOptions = [
    ...new Set([
      preview.appointment.contact.timezone,
      preview.appointment.displayTimezone,
      ...COMMON_TIMEZONES,
    ]),
  ]

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    form.clearErrors()

    const schema = buildRescheduleSchema(preview.appointment.startsAtUtc)
    const parsed = schema.safeParse(values)

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]

        if (typeof field === "string") {
          form.setError(field as keyof RescheduleFormValues, {
            message: issue.message,
          })
        }
      }

      return
    }

    await mutation.mutateAsync({
      token,
      input: {
        preferredStartAtUtc: localDateTimeToUtcIso(
          parsed.data.preferredStartAtLocal,
          parsed.data.preferredTimezone,
        ),
        preferredTimezone: parsed.data.preferredTimezone,
        message: parsed.data.message?.trim() || null,
      },
    })
  })

  if (mutation.isSuccess) {
    return (
      <section className="surface-panel overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 via-secondary to-sky-500" />
        <div className="space-y-6 p-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/14 text-amber-600">
            <CalendarClock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-micro">Request Submitted</p>
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground">
              Reschedule Request Sent
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Your preferred time has been logged for review. The appointment team can now see the
              request directly in the reschedule inbox.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Requested Time"
              value={formatAppointmentDate(
                mutation.data.request.preferredStartAtUtc,
                mutation.data.request.preferredTimezone,
              )}
            />
            <MetricCard
              label="Request Status"
              value={mutation.data.request.status}
            />
          </div>

          {mutation.data.request.message ? (
            <div className="rounded-3xl border border-border/70 bg-muted/60 px-5 py-4">
              <p className="text-micro">Your Note</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {mutation.data.request.message}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className="surface-panel overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-amber-500 via-secondary to-sky-500" />
      <div className="space-y-8 p-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/14 text-amber-600">
          <CalendarClock className="h-7 w-7" />
        </div>

        <div className="space-y-3">
          <p className="text-micro">Request A New Time</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-foreground">
            Propose A Reschedule
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Submit one clear alternative and the business can review it from the same operations
            dashboard that tracks confirmations and reminder delivery.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Preferred Date & Time"
              error={form.formState.errors.preferredStartAtLocal?.message}
            >
              <input
                {...form.register("preferredStartAtLocal")}
                type="datetime-local"
                className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
              />
            </Field>

            <Field
              label="Timezone"
              error={form.formState.errors.preferredTimezone?.message}
            >
              <select
                {...form.register("preferredTimezone")}
                className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
              >
                {timeZoneOptions.map((timeZone) => (
                  <option key={timeZone} value={timeZone}>
                    {timeZone}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Reason For Change" error={form.formState.errors.message?.message}>
            <textarea
              {...form.register("message")}
              rows={4}
              className="min-h-32 w-full rounded-3xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
              placeholder="Optional note for the team reviewing this request."
            />
          </Field>

          {submitError ? (
            <div className="rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {mutation.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="mr-2 h-4 w-4" />
              )}
              Submit Request
            </button>
            <p className="text-sm text-muted-foreground">
              The current appointment remains unchanged until the business reviews this request.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-micro">{label}</span>
      {children}
      {error ? <span className="block text-sm text-destructive">{error}</span> : null}
    </label>
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
      <p className="mt-2 text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  )
}

export { RescheduleRequestPanel }
