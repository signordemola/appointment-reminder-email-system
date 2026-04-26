import { NextResponse } from "next/server"

import type { DispatchDueRemindersResult } from "@/lib/api"
import { getApiBaseUrl } from "@/lib/api"

type DispatchRequestBody = {
  limit?: number
  appointmentId?: string
}

export async function POST(request: Request) {
  let body: DispatchRequestBody = {}

  try {
    body = (await request.json()) as DispatchRequestBody
  } catch {}

  const response = await fetch(`${getApiBaseUrl()}/internal/jobs/dispatch-due-reminders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.INTERNAL_JOB_SECRET
        ? {
            "x-job-secret": process.env.INTERNAL_JOB_SECRET,
          }
        : {}),
    },
    body: JSON.stringify({
      limit: body.limit ?? 10,
      appointmentId: body.appointmentId ?? undefined,
    }),
    cache: "no-store",
  })

  const data = (await response.json().catch(() => null)) as
    | DispatchDueRemindersResult
    | { message?: string }
    | null

  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          data && "message" in data && typeof data.message === "string"
            ? data.message
            : "Unable to dispatch reminders.",
      },
      {
        status: response.status,
      },
    )
  }

  return NextResponse.json(data as DispatchDueRemindersResult)
}
