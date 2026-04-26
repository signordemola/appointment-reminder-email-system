"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createAppointment } from "@/lib/api"
import { COMMON_TIMEZONES, localDateTimeToUtcIso } from "@/lib/date-time"

const newAppointmentSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    contactTimezone: z.string().min(3, "Choose a contact timezone."),
    title: z.string().trim().min(2, "Appointment title is required.").max(160),
    locationName: z.string().trim().max(160).optional().or(z.literal("")),
    startsAtLocal: z.string().min(1, "Start date and time are required."),
    endsAtLocal: z.string().optional().or(z.literal("")),
    displayTimezone: z.string().min(3, "Choose a display timezone."),
    externalReference: z.string().trim().max(160).optional().or(z.literal("")),
  })
  .superRefine((values, context) => {
    let startsAtIso: string

    try {
      startsAtIso = localDateTimeToUtcIso(values.startsAtLocal, values.displayTimezone)
    } catch (error) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAtLocal"],
        message: error instanceof Error ? error.message : "Enter a valid start date and time.",
      })
      return
    }

    const startsAt = new Date(startsAtIso)

    if (startsAt.getTime() <= Date.now()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAtLocal"],
        message: "Start date must be in the future.",
      })
    }

    if (!values.endsAtLocal) {
      return
    }

    let endsAtIso: string

    try {
      endsAtIso = localDateTimeToUtcIso(values.endsAtLocal, values.displayTimezone)
    } catch (error) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAtLocal"],
        message: error instanceof Error ? error.message : "Enter a valid end date and time.",
      })
      return
    }

    const endsAt = new Date(endsAtIso)

    if (endsAt.getTime() <= startsAt.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAtLocal"],
        message: "End date must be later than the start date.",
      })
    }
  })

type NewAppointmentFormValues = z.input<typeof newAppointmentSchema>

function NewAppointmentForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const form = useForm<NewAppointmentFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      contactTimezone: "America/New_York",
      title: "",
      locationName: "",
      startsAtLocal: "",
      endsAtLocal: "",
      displayTimezone: "America/New_York",
      externalReference: "",
    },
  })

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async (appointment) => {
      await queryClient.invalidateQueries()
      router.push(`/appointments/${appointment.id}`)
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Unable to create appointment.")
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    form.clearErrors()

    const parsed = newAppointmentSchema.safeParse(values)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string") {
          form.setError(field as keyof NewAppointmentFormValues, {
            message: issue.message,
          })
        }
      }
      return
    }

    await mutation.mutateAsync({
      fullName: parsed.data.fullName.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone?.trim() || null,
      contactTimezone: parsed.data.contactTimezone,
      emailOptOut: false,
      title: parsed.data.title.trim(),
      locationName: parsed.data.locationName?.trim() || null,
      startsAtUtc: localDateTimeToUtcIso(
        parsed.data.startsAtLocal,
        parsed.data.displayTimezone,
      ),
      endsAtUtc: parsed.data.endsAtLocal
        ? localDateTimeToUtcIso(parsed.data.endsAtLocal, parsed.data.displayTimezone)
        : null,
      displayTimezone: parsed.data.displayTimezone,
      externalReference: parsed.data.externalReference?.trim() || null,
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="surface-panel grid gap-5 p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <p className="text-micro">Contact Information</p>
          <h2 className="text-2xl font-bold text-foreground">Primary Contact</h2>
        </div>
        <Field
          label="Full Name"
          error={form.formState.errors.fullName?.message}
          className="md:col-span-2"
        >
          <input
            {...form.register("fullName")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input
            {...form.register("email")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="jane@example.com"
            type="email"
          />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input
            {...form.register("phone")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="+1 555 010 200"
          />
        </Field>
        <Field
          label="Contact Timezone"
          error={form.formState.errors.contactTimezone?.message}
          className="md:col-span-2"
        >
          <select
            {...form.register("contactTimezone")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
          >
            {COMMON_TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="surface-panel grid gap-5 p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <p className="text-micro">Appointment Details</p>
          <h2 className="text-2xl font-bold text-foreground">Schedule Context</h2>
        </div>
        <Field
          label="Appointment Title"
          error={form.formState.errors.title?.message}
          className="md:col-span-2"
        >
          <input
            {...form.register("title")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="Quarterly operations review"
          />
        </Field>
        <Field
          label="Location / Meeting Link"
          error={form.formState.errors.locationName?.message}
          className="md:col-span-2"
        >
          <input
            {...form.register("locationName")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="Boardroom A or meeting URL"
          />
        </Field>
        <Field label="Start" error={form.formState.errors.startsAtLocal?.message}>
          <input
            {...form.register("startsAtLocal")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            type="datetime-local"
          />
        </Field>
        <Field label="End" error={form.formState.errors.endsAtLocal?.message}>
          <input
            {...form.register("endsAtLocal")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            type="datetime-local"
          />
        </Field>
        <Field label="Display Timezone" error={form.formState.errors.displayTimezone?.message}>
          <select
            {...form.register("displayTimezone")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
          >
            {COMMON_TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="External Reference"
          error={form.formState.errors.externalReference?.message}
        >
          <input
            {...form.register("externalReference")}
            className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
            placeholder="CRM-2026-0042"
          />
        </Field>
      </section>

      <div className="surface-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Reminder plan</p>
          <p className="text-sm text-muted-foreground">
            The API will automatically generate a confirmation request plus the default reminder events.
          </p>
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/appointments")}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Create Appointment
          </Button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-micro">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-destructive">{error}</span> : null}
    </label>
  )
}

export { NewAppointmentForm }
