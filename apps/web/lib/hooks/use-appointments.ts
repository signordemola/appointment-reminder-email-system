import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '../api'

export interface Appointment {
  id: string
  contactId: string
  contact: {
    id: string
    fullName: string
    email: string
    phone: string | null
    timezone: string
    emailOptOut: boolean
  }
  title: string
  locationName: string | null
  startsAtUtc: string
  endsAtUtc: string | null
  displayTimezone: string
  status: string
  confirmationStatus: string
  externalReference: string | null
  reminderEvents: Array<{
    id: string
    eventType: string
    status: string
    scheduledForUtc: string
  }>
  createdAt: string
  updatedAt: string
}

export interface PaginatedAppointments {
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: Appointment[]
}

export interface CreateAppointmentInput {
  fullName: string
  email: string
  phone?: string | null
  contactTimezone: string
  emailOptOut?: boolean
  title: string
  locationName?: string
  startsAtUtc: string
  endsAtUtc?: string | null
  displayTimezone: string
  externalReference?: string
}

export function useAppointments(params?: { page?: number; pageSize?: number; status?: string; search?: string }) {
  const { page = 1, pageSize = 10, status, search } = params ?? {}
  const queryString = new URLSearchParams()
  queryString.set('page', String(page))
  queryString.set('pageSize', String(pageSize))
  if (status) queryString.set('status', status)
  if (search) queryString.set('search', search)

  return useQuery<PaginatedAppointments>({
    queryKey: ['appointments', page, pageSize, status, search],
    queryFn: () => get(`/appointments?${queryString.toString()}`),
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation<Appointment, Error, CreateAppointmentInput>({
    mutationFn: (input) => post('/appointments', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
