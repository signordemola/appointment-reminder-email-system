import { NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/api"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const response = await fetch(`${getApiBaseUrl()}/ai/reminder-copy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | Record<string, unknown>
    | null

  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          data && "message" in data && typeof data.message === "string"
            ? data.message
            : "Unable to generate reminder copy.",
      },
      {
        status: response.status,
      },
    )
  }

  return NextResponse.json(data)
}
