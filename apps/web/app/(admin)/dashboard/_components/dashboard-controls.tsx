"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle, RefreshCcw, SendHorizontal, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DispatchDueRemindersResult } from "@/lib/api"

async function dispatchDueReminders() {
  const response = await fetch("/api/internal/jobs/dispatch-due-reminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit: 10,
    }),
  })

  const data = (await response.json().catch(() => null)) as
    | DispatchDueRemindersResult
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(
      data && "message" in data && typeof data.message === "string"
        ? data.message
        : "Unable to dispatch reminders.",
    )
  }

  return data as DispatchDueRemindersResult
}

function DashboardControls() {
  const router = useRouter()
  const [isRefreshing, startRefresh] = React.useTransition()
  const [lastResult, setLastResult] = React.useState<DispatchDueRemindersResult | null>(null)

  const mutation = useMutation({
    mutationFn: dispatchDueReminders,
    onSuccess: (result) => {
      setLastResult(result)
      router.refresh()
    },
  })

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            startRefresh(() => {
              router.refresh()
            })
          }}
          disabled={isRefreshing || mutation.isPending}
        >
          {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh Metrics
        </Button>

        <Button
          size="lg"
          onClick={() => mutation.mutate()}
          disabled={isRefreshing || mutation.isPending}
        >
          {mutation.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          Dispatch Due Reminders
        </Button>

        <Link
          href="/appointments/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90"
        >
          Create Appointment
        </Link>
      </div>

      {mutation.error ? (
        <div className="max-w-xl rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Unable to dispatch reminders."}
        </div>
      ) : null}

      {lastResult ? (
        <div className="max-w-xl rounded-3xl border border-secondary/15 bg-secondary/8 px-5 py-4 text-sm text-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-secondary" />
            Dispatch finished
          </div>
          <p className="mt-2 text-muted-foreground">
            Claimed {lastResult.claimedCount}, sent {lastResult.sentCount}, failed{" "}
            {lastResult.failedCount}, skipped {lastResult.skippedCount}, canceled{" "}
            {lastResult.canceledCount}.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export { DashboardControls }
