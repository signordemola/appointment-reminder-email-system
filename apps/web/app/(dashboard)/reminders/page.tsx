import { Suspense } from 'react'
import { RemindersContent } from './reminders-content'
import { RemindersContentSkeleton } from './reminders-skeleton'
import type { ReminderRule } from '@/lib/hooks/use-reminders'

export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchReminderRules(): Promise<ReminderRule[]> {
  const response = await fetch(`${API_URL}/reminder-rules`, {
    next: { revalidate: 30 },
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Reminder Rules API returned ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// ── Async data component (wrapped in Suspense) ───────────────
async function RemindersData() {
  const rules = await fetchReminderRules()
  return <RemindersContent initialRules={rules} />
}

// ── Page: shell renders instantly, data streams in ───────────
export default function RemindersPage() {
  return (
    <Suspense fallback={<RemindersContentSkeleton />}>
      <RemindersData />
    </Suspense>
  )
}
