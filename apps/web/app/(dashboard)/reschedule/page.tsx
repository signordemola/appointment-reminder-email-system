import { Suspense } from 'react'
import { RescheduleContent } from './reschedule-content'
import { RescheduleContentSkeleton } from './reschedule-skeleton'
import type { RescheduleRequest } from '@/lib/hooks/use-reschedule'

export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchRescheduleRequests(): Promise<RescheduleRequest[]> {
  const response = await fetch(`${API_URL}/reschedule-requests`, {
    next: { revalidate: 30 },
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Reschedule API returned ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// ── Async data component (wrapped in Suspense) ───────────────
async function RescheduleData() {
  const requests = await fetchRescheduleRequests()
  return <RescheduleContent initialRequests={requests} />
}

// ── Page: shell renders instantly, data streams in ───────────
export default function ReschedulePage() {
  return (
    <Suspense fallback={<RescheduleContentSkeleton />}>
      <RescheduleData />
    </Suspense>
  )
}
