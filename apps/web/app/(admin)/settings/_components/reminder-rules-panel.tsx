"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import {
  AlarmClockCheck,
  CalendarRange,
  LoaderCircle,
  MailCheck,
  Save,
} from "lucide-react"
import { useRouter } from "next/navigation"

import type { ReminderRule } from "@/lib/api"

type ReminderRuleDraft = {
  id: string
  name: string
  offsetMinutes: string
  active: boolean
  eventType: ReminderRule["eventType"]
}

async function updateReminderRuleRequest(
  reminderRuleId: string,
  input: {
    name: string
    offsetMinutes: number
    active: boolean
  },
) {
  const response = await fetch(`/api/reminder-rules/${reminderRuleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const data = (await response.json().catch(() => null)) as
    | ReminderRule
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(
      data && "message" in data && typeof data.message === "string"
        ? data.message
        : "Unable to update reminder rule.",
    )
  }

  return data as ReminderRule
}

function ReminderRulesPanel({ initialRules }: { initialRules: ReminderRule[] }) {
  const router = useRouter()
  const [drafts, setDrafts] = React.useState<ReminderRuleDraft[]>(
    initialRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      offsetMinutes: String(rule.offsetMinutes),
      active: rule.active,
      eventType: rule.eventType,
    })),
  )
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const updates = drafts.map((draft) => {
        const offsetMinutes = Number.parseInt(draft.offsetMinutes, 10)

        if (!draft.name.trim()) {
          throw new Error("Reminder rule names cannot be empty.")
        }

        if (Number.isNaN(offsetMinutes)) {
          throw new Error("Offset minutes must be a valid number.")
        }

        return updateReminderRuleRequest(draft.id, {
          name: draft.name.trim(),
          offsetMinutes,
          active: draft.active,
        })
      })

      return Promise.all(updates)
    },
    onSuccess: (updatedRules) => {
      setDrafts(
        updatedRules.map((rule) => ({
          id: rule.id,
          name: rule.name,
          offsetMinutes: String(rule.offsetMinutes),
          active: rule.active,
          eventType: rule.eventType,
        })),
      )
      setStatusMessage("Reminder rules updated.")
      router.refresh()
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save reminder rules.")
    },
  })

  return (
    <section className="surface-panel p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-micro">Reminder Policy</p>
          <h2 className="text-2xl font-bold text-foreground">Active Reminder Rules</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            This mirrors the real backend reminder-rules API. Edit the rule names, offsets, and
            active state the way a client would expect from an admin settings surface.
          </p>
        </div>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-55"
        >
          {mutation.isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Rules
        </button>
      </div>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <article key={draft.id} className="surface-inset p-5">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.7fr_0.55fr]">
              <label className="space-y-2">
                <span className="text-micro">Rule Name</span>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item) =>
                        item.id === draft.id ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-micro">Offset Minutes</span>
                <div className="relative">
                  <AlarmClockCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={draft.offsetMinutes}
                    onChange={(event) =>
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === draft.id
                            ? { ...item, offsetMinutes: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {describeOffset(draft.eventType, draft.offsetMinutes)}
                </p>
              </label>

              <label className="space-y-2">
                <span className="text-micro">Active</span>
                <button
                  type="button"
                  onClick={() =>
                    setDrafts((current) =>
                      current.map((item) =>
                        item.id === draft.id ? { ...item, active: !item.active } : item,
                      ),
                    )
                  }
                  className={`flex h-11 w-full items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition-colors ${
                    draft.active
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                      : "border-border/70 bg-card text-muted-foreground"
                  }`}
                >
                  <span>{draft.active ? "Enabled" : "Paused"}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      draft.active ? "bg-emerald-600" : "bg-muted-foreground"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1">
                <MailCheck className="h-3.5 w-3.5 text-secondary" />
                Email
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1">
                <CalendarRange className="h-3.5 w-3.5 text-secondary" />
                {draft.eventType.replaceAll("_", " ")}
              </span>
            </div>
          </article>
        ))}
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

function describeOffset(
  eventType: ReminderRule["eventType"],
  rawValue: string,
) {
  const offsetMinutes = Number.parseInt(rawValue, 10)

  if (Number.isNaN(offsetMinutes)) {
    return "Enter a whole number of minutes."
  }

  if (offsetMinutes === 0) {
    return eventType === "confirmation_request"
      ? "Sent immediately when the appointment is created."
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

export { ReminderRulesPanel }
