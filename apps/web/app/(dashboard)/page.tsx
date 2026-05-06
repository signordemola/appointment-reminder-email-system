import { DateTime } from 'luxon'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { DashboardContent } from './dashboard-content'
import type {
  DashboardSummary,
  StatCard,
  DeliveryMetrics,
  UpcomingAppointment,
  ActivityEvent,
  PreparedDashboardData,
} from '@/lib/types/dashboard.types'

// ── Server-side data fetch with caching ──────────────────────
export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchDashboardData(): Promise<DashboardSummary> {
  const response = await fetch(`${API_URL}/dashboard/summary`, {
    next: { revalidate: 30 }, // ISR: revalidate every 30 seconds
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Dashboard API returned ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// ── Prepare data for the client component ────────────────────
function prepareDashboardData(raw: DashboardSummary): PreparedDashboardData {
  const m = raw.metrics

  // KPI cards
  const totalReminders = m.remindersSentToday + m.deliveryFailures + m.bounceCount
  const deliveryRate = totalReminders > 0 ? (m.remindersSentToday / totalReminders) * 100 : 0
  const totalAppts = m.confirmedAppointments + m.pendingConfirmations
  const confirmationRate = totalAppts > 0 ? (m.confirmedAppointments / totalAppts) * 100 : 0
  const totalAllAppts = m.confirmedAppointments + m.pendingConfirmations + m.canceledAppointments + m.noShows
  const noShowRate = totalAllAppts > 0 ? (m.noShows / totalAllAppts) * 100 : 0

  const stats: StatCard[] = [
    {
      title: "Today's Appointments",
      value: m.appointmentsToday,
      change: `${m.appointmentsToday} scheduled today`,
      trend: 'neutral',
      icon: 'calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Confirmed',
      value: m.confirmedAppointments,
      change: `${Math.round(confirmationRate)}% confirmation rate`,
      trend: 'up',
      icon: 'check-circle',
      color: 'text-status-confirmed',
      bgColor: 'bg-status-confirmed/10',
    },
    {
      title: 'Pending Response',
      value: m.pendingConfirmations,
      change: 'Awaiting confirmation',
      trend: 'neutral',
      icon: 'clock',
      color: 'text-status-pending',
      bgColor: 'bg-status-pending/10',
    },
    {
      title: 'Reschedule Requests',
      value: m.rescheduleRequests,
      change: m.rescheduleRequests > 0 ? 'Needs attention' : 'All caught up',
      trend: m.rescheduleRequests > 0 ? 'down' : 'neutral',
      icon: 'alert-triangle',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  const deliveryMetrics: DeliveryMetrics = {
    deliveryRate,
    confirmationRate,
    noShowRate,
    totalReminders,
    totalAppts,
    remindersSent: m.remindersSentToday,
    confirmedAppts: m.confirmedAppointments,
    noShows: m.noShows,
  }

  // Upcoming appointments
  const upcomingToday: UpcomingAppointment[] = (raw.upcomingToday ?? []).map((appt) => ({
    id: appt.id,
    client: appt.contact.fullName,
    service: appt.title,
    time: DateTime.fromISO(appt.startsAtUtc).toFormat('h:mm a'),
    status: appt.status,
    initials: appt.contact.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    phone: appt.contact.phone || '',
  }))

  // Recent activity
  const messageMap: Record<string, (name: string) => string> = {
    sent: (n) => `Reminder sent to ${n}`,
    delivered: (n) => `Reminder delivered to ${n}`,
    opened: (n) => `${n} opened their reminder`,
    clicked: (n) => `${n} clicked the reminder link`,
    failed: (n) => `Reminder failed to send to ${n}`,
    bounced: (n) => `Reminder bounced for ${n}`,
  }

  const recentEvents: ActivityEvent[] = (raw.recentEvents ?? []).map((event) => ({
    id: event.id,
    type: event.status,
    message:
      messageMap[event.status]?.(event.appointment.contact.fullName) ??
      `Event: ${event.status} for ${event.appointment.contact.fullName}`,
    time: event.processedAt
      ? DateTime.fromISO(event.processedAt).toRelative() || 'Just now'
      : 'Just now',
  }))

  return {
    stats,
    weeklyBreakdown: raw.weeklyBreakdown ?? [],
    deliveryMetrics,
    upcomingToday,
    recentEvents,
  }
}

// ── Server Component Page ────────────────────────────────────
export default async function DashboardPage() {
  const raw = await fetchDashboardData()
  const data = prepareDashboardData(raw)

  return (
    <>
      <Header
        title="Dashboard"
        actions={
          <Button size="sm" className="gap-1" asChild>
            <Link href="/appointments">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </Link>
          </Button>
        }
      />
      <DashboardContent data={data} />
    </>
  )
}
