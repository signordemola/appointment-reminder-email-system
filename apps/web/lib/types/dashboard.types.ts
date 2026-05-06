// Shared dashboard types — used by server page, client content, and skeletons

// ── Raw API Response ──────────────────────────────────────────
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

// ── Computed KPI Card ──────────────────────────────────────────
export interface StatCard {
  title: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
  color: string
  bgColor: string
}

// ── Computed Delivery Metrics ──────────────────────────────────
export interface DeliveryMetrics {
  deliveryRate: number
  confirmationRate: number
  noShowRate: number
  totalReminders: number
  totalAppts: number
  remindersSent: number
  confirmedAppts: number
  noShows: number
}

// ── Prepared Upcoming Appointment ─────────────────────────────
export interface UpcomingAppointment {
  id: string
  client: string
  service: string
  time: string
  status: string
  initials: string
  phone: string
}

// ── Prepared Activity Event ───────────────────────────────────
export interface ActivityEvent {
  id: string
  type: string
  message: string
  time: string
}

// ── Full prepared props for <DashboardContent /> ──────────────
export interface PreparedDashboardData {
  stats: StatCard[]
  weeklyBreakdown: DashboardSummary['weeklyBreakdown']
  deliveryMetrics: DeliveryMetrics
  upcomingToday: UpcomingAppointment[]
  recentEvents: ActivityEvent[]
}
