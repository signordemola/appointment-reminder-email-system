"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import {
  Clipboard,
  LoaderCircle,
  MailPlus,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ReminderRule } from "@/lib/api"

type ReminderCopyTone = "professional" | "warm" | "reassuring" | "concise"

type ReminderCopyResult = {
  generatedAt: string
  reminderRule: {
    id: string
    name: string
    eventType: ReminderRule["eventType"]
    offsetMinutes: number
    active: boolean
  }
  provider: "gemini"
  model: string
  draft: {
    subject: string
    previewText: string
    bodyText: string
    rationale: string
    placeholdersUsed: string[]
  }
}

type ReminderCopyRequest = {
  reminderRuleId: string
  businessName: string
  businessType: string
  senderName: string
  tone: ReminderCopyTone
  includeLocation: boolean
  includeRescheduleOption: boolean
  additionalInstructions?: string
}

async function generateReminderCopyRequest(input: ReminderCopyRequest) {
  const response = await fetch("/api/ai/reminder-copy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const data = (await response.json().catch(() => null)) as
    | ReminderCopyResult
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(
      data && "message" in data && typeof data.message === "string"
        ? data.message
        : "Unable to generate reminder copy.",
    )
  }

  return data as ReminderCopyResult
}

function describeOffset(
  eventType: ReminderRule["eventType"],
  offsetMinutes: number,
) {
  if (offsetMinutes === 0) {
    return eventType === "confirmation_request"
      ? "Sent immediately when an appointment is created."
      : "Sent exactly at the appointment start time."
  }

  const absoluteMinutes = Math.abs(offsetMinutes)
  const absoluteHours = absoluteMinutes / 60

  if (absoluteMinutes < 60) {
    return `${absoluteMinutes} minute${absoluteMinutes === 1 ? "" : "s"} before the appointment.`
  }

  if (absoluteHours % 24 === 0) {
    const absoluteDays = absoluteHours / 24
    return `${absoluteDays} day${absoluteDays === 1 ? "" : "s"} before the appointment.`
  }

  return `${absoluteHours} hour${absoluteHours === 1 ? "" : "s"} before the appointment.`
}

function formatEventTypeLabel(value: ReminderRule["eventType"]) {
  return value.replaceAll("_", " ")
}

function toneLabel(value: ReminderCopyTone) {
  return value.replaceAll("_", " ")
}

function ReminderCopyLab({ reminderRules }: { reminderRules: ReminderRule[] }) {
  const [selectedRuleId, setSelectedRuleId] = React.useState(reminderRules[0]?.id ?? "")
  const [businessName, setBusinessName] = React.useState("Northshore Wellness Clinic")
  const [businessType, setBusinessType] = React.useState("private wellness and therapy clinic")
  const [senderName, setSenderName] = React.useState("Client Care Team")
  const [tone, setTone] = React.useState<ReminderCopyTone>("warm")
  const [includeLocation, setIncludeLocation] = React.useState(true)
  const [includeRescheduleOption, setIncludeRescheduleOption] = React.useState(true)
  const [additionalInstructions, setAdditionalInstructions] = React.useState(
    "Keep the copy calm, clear, and easy to act on.",
  )
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  const selectedRule = reminderRules.find((rule) => rule.id === selectedRuleId) ?? reminderRules[0]

  const mutation = useMutation({
    mutationFn: () =>
      generateReminderCopyRequest({
        reminderRuleId: selectedRuleId,
        businessName: businessName.trim(),
        businessType: businessType.trim(),
        senderName: senderName.trim(),
        tone,
        includeLocation,
        includeRescheduleOption,
        additionalInstructions: additionalInstructions.trim() || undefined,
      }),
    onSuccess: () => {
      setStatusMessage("AI reminder copy generated.")
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : "Unable to generate reminder copy.")
    },
  })

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current))
      }, 1600)
    } catch {
      setStatusMessage("Clipboard access is not available in this browser.")
    }
  }

  if (!selectedRule) {
    return null
  }

  return (
    <section className="surface-panel p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-micro">AI Message Lab</p>
          <h2 className="text-2xl font-bold text-foreground">Generate Reminder Copy</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Draft transactional reminder copy against a real reminder rule. The output is tuned for
            appointment businesses and uses runtime placeholders instead of hardcoded values.
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={mutation.isPending || !selectedRuleId}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Copy
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <article className="surface-inset p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-micro">Reminder Rule</span>
                <select
                  value={selectedRuleId}
                  onChange={(event) => setSelectedRuleId(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                >
                  {reminderRules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-micro">Tone</span>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value as ReminderCopyTone)}
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                >
                  {(["professional", "warm", "reassuring", "concise"] as const).map((value) => (
                    <option key={value} value={value}>
                      {toneLabel(value)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-micro">Business Name</span>
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-micro">Sender Name</span>
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-micro">Business Type</span>
                <input
                  value={businessType}
                  onChange={(event) => setBusinessType(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-micro">Additional Instructions</span>
                <textarea
                  value={additionalInstructions}
                  onChange={(event) => setAdditionalInstructions(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIncludeLocation((current) => !current)}
                className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition-colors ${
                  includeLocation
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                    : "border-border/70 bg-card text-muted-foreground"
                }`}
              >
                <span>Include location placeholder</span>
                <span className={`h-2.5 w-2.5 rounded-full ${includeLocation ? "bg-emerald-600" : "bg-muted-foreground"}`} />
              </button>

              <button
                type="button"
                onClick={() => setIncludeRescheduleOption((current) => !current)}
                className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition-colors ${
                  includeRescheduleOption
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                    : "border-border/70 bg-card text-muted-foreground"
                }`}
              >
                <span>Include reschedule option</span>
                <span className={`h-2.5 w-2.5 rounded-full ${includeRescheduleOption ? "bg-emerald-600" : "bg-muted-foreground"}`} />
              </button>
            </div>
          </article>

          <article className="surface-inset p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-sm">
                <MailPlus className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedRule.name}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {formatEventTypeLabel(selectedRule.eventType)} •{" "}
                  {describeOffset(selectedRule.eventType, selectedRule.offsetMinutes)}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              The generator uses this live reminder rule as the timing and workflow context for the
              draft.
            </p>
          </article>
        </div>

        <article className="surface-inset p-5">
          <div className="mb-5 space-y-1">
            <p className="text-micro">Generated Output</p>
            <h3 className="text-xl font-semibold text-foreground">Preview</h3>
          </div>

          {mutation.data ? (
            <div className="space-y-4">
              <CopyField
                label="Subject"
                value={mutation.data.draft.subject}
                copied={copiedField === "subject"}
                onCopy={() => copyValue("subject", mutation.data.draft.subject)}
              />

              <CopyField
                label="Preview Text"
                value={mutation.data.draft.previewText}
                copied={copiedField === "preview"}
                onCopy={() => copyValue("preview", mutation.data.draft.previewText)}
              />

              <CopyField
                label="Body Copy"
                value={mutation.data.draft.bodyText}
                copied={copiedField === "body"}
                onCopy={() => copyValue("body", mutation.data.draft.bodyText)}
                multiline
              />

              <div className="space-y-2">
                <p className="text-micro">Rationale</p>
                <p className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                  {mutation.data.draft.rationale}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-micro">Placeholders Used</p>
                <div className="flex flex-wrap gap-2">
                  {mutation.data.draft.placeholdersUsed.map((value) => (
                    <span
                      key={value}
                      className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-foreground"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[0.68rem] text-muted-foreground">
                Generated with {mutation.data.provider} • {mutation.data.model}
              </p>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 text-center">
              <Sparkles className="h-7 w-7 text-secondary" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No draft yet</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Generate a transactional email draft tied to one of your live reminder rules.
                </p>
              </div>
            </div>
          )}
        </article>
      </div>

      {statusMessage ? (
        <div
          className={`mt-5 rounded-3xl border px-5 py-4 text-sm ${
            mutation.isError
              ? "border-destructive/15 bg-destructive/8 text-destructive"
              : "border-secondary/15 bg-secondary/8 text-foreground"
          }`}
        >
          {statusMessage}
        </div>
      ) : null}
    </section>
  )
}

function CopyField({
  label,
  value,
  copied,
  onCopy,
  multiline = false,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
  multiline?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-micro">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Clipboard className="mr-1 h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {multiline ? (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm leading-6 text-foreground">
          {value}
        </pre>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
          {value}
        </div>
      )}
    </div>
  )
}

export { ReminderCopyLab }
