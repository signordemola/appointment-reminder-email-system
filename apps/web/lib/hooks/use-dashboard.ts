import { useQuery } from '@tanstack/react-query'
import { get } from '../api'

export interface DashboardSummary {
  metrics: {
    appointmentsToday: number
    confirmedAppointments: number
    pendingConfirmations: number
    rescheduleRequests: number
    canceledAppointments: number
    noShows: number
    remindersSentToday: number
    deliveryFailures: number
    bounceCount: number
  }
  weeklyBreakdown: Array<{
    day: string
    confirmed: number
    pending: number
    cancelled: number
    noShow: number
  }>
  reminderActivity: Array<{
    day: string
    sent: number
    failed: number
    bounced: number
  }>
  upcomingToday: Array<{
    id: string
    title: string
    startsAtUtc: string
    status: string
    contact: {
      fullName: string
      email: string
      phone: string | null
    }
  }>
  recentEvents: Array<{
    id: string
    status: string
    eventType: string
    processedAt: string | null
    appointment: {
      title: string
      contact: {
        fullName: string
      }
    }
  }>
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => get('/dashboard/summary'),
  })
}
