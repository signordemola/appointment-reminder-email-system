import { NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/api"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const body = await request.json().catch(() => ({}))

  const response = await fetch(`${getApiBaseUrl()}/reminder-rules/${id}`, {
    method: "PATCH",
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
            : "Unable to update reminder rule.",
      },
      {
        status: response.status,
      },
    )
  }

  return NextResponse.json(data)
}
