export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'cancelled' 
  | 'no_show' 
  | 'completed'
  | 'rescheduled'

export type ReminderChannel = 'email' | 'sms'

export type ReminderTrigger = 'before_appointment' | 'after_no_confirmation'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  contactId: string
  contact: Contact
  serviceType: string
  scheduledAt: Date
  durationMinutes: number
  status: AppointmentStatus
  staffName: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ReminderRule {
  id: string
  name: string
  channel: ReminderChannel
  trigger: ReminderTrigger
  offsetMinutes: number
  isActive: boolean
  subjectTemplate: string | null
  bodyTemplate: string
  createdAt: Date
  updatedAt: Date
}

export interface ReminderEvent {
  id: string
  appointmentId: string
  ruleId: string
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
  scheduledFor: Date
  sentAt: Date | null
  deliveredAt: Date | null
  errorMessage: string | null
  createdAt: Date
}

export interface RescheduleRequest {
  id: string
  appointmentId: string
  appointment: Appointment
  requestedAt: Date
  preferredDates: string | null
  reason: string | null
  status: 'pending' | 'approved' | 'denied'
  resolvedAt: Date | null
  createdAt: Date
}

export interface DashboardMetrics {
  appointmentsToday: number
  confirmed: number
  pending: number
  rescheduleRequests: number
  noShows: number
  deliveryRate: number
  confirmationRate: number
  weeklyTrend: {
    date: string
    confirmed: number
    pending: number
    noShow: number
  }[]
}
