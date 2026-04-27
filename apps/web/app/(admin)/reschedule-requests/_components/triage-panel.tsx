"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateRescheduleTriage, type RescheduleTriageResult } from "@/lib/api"

const urgencyTone: Record<RescheduleTriageResult["triage"]["urgency"], string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
}

const riskTone: Record<RescheduleTriageResult["triage"]["operationalRisk"], string> = {
  none: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  watch: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
}

const confidenceTone: Record<RescheduleTriageResult["triage"]["confidence"], string> = {
  low: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  medium: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200",
  high: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200",
}

function formatEnumLabel(value: string) {
  return value.replaceAll("_", " ")
}

function TriagePill({
  label,
  tone,
}: {
  label: string
  tone: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
        tone,
      )}
    >
      {label}
    </span>
  )
}

function TriagePanel({
  requestId,
  initialResult = null,
}: {
  requestId: string
  initialResult?: RescheduleTriageResult | null
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => generateRescheduleTriage(requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reschedule-requests"],
      })
    },
  })
  const result = mutation.data ?? initialResult

  const errorMessage =
    mutation.error instanceof Error
      ? mutation.error.message
      : "AI triage could not be generated."

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            AI Triage
          </p>
          <p className="text-xs text-muted-foreground">
            Turn the client message into an ops-ready summary for the front desk.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Analyzing..." : result ? "Refresh AI" : "Run AI"}
        </Button>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <TriagePill
              label={`${formatEnumLabel(result.triage.urgency)} urgency`}
              tone={urgencyTone[result.triage.urgency]}
            />
            <TriagePill
              label={`${formatEnumLabel(result.triage.operationalRisk)} risk`}
              tone={riskTone[result.triage.operationalRisk]}
            />
            <TriagePill
              label={`${formatEnumLabel(result.triage.confidence)} confidence`}
              tone={confidenceTone[result.triage.confidence]}
            />
          </div>

          <dl className="space-y-3 text-sm">
            <div className="space-y-1">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Admin Summary
              </dt>
              <dd className="text-foreground">{result.triage.adminSummary}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recommended Action
              </dt>
              <dd className="text-foreground">
                {formatEnumLabel(result.triage.recommendedAction)}
                {result.triage.needsHumanFollowUp ? " - human follow-up needed" : ""}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Likely Reason
              </dt>
              <dd className="text-foreground">
                {formatEnumLabel(result.triage.likelyReasonCategory)}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Suggested Reply
              </dt>
              <dd className="text-muted-foreground">{result.triage.suggestedReply}</dd>
            </div>
          </dl>

          {result.triage.riskFlags.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Risk Flags
              </p>
              <div className="flex flex-wrap gap-2">
                {result.triage.riskFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full border border-border/70 bg-muted/70 px-2.5 py-1 text-xs text-foreground"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-[0.68rem] text-muted-foreground">
            Generated with {result.provider} - {result.model}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          AI triage will appear here after the request is interpreted for the front desk.
        </p>
      )}
    </div>
  )
}

export { TriagePanel }
