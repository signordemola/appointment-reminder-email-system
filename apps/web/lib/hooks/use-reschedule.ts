import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '../api'

export interface RescheduleRequest {
  id: string
  appointmentId: string
  message: string | null
  preferredStartAtUtc: string
  preferredTimezone: string
  status: 'pending' | 'accepted' | 'dismissed'
  reviewedAt: string | null
  reviewedBy: string | null
  aiTriage: unknown | null
  createdAt: string
  updatedAt: string
  appointment: {
    id: string
    title: string
    startsAtUtc: string
    displayTimezone: string
    status: string
    contact: {
      fullName: string
      email: string
      phone: string | null
    }
  }
}

export interface ReviewRescheduleInput {
  id: string
  decision: 'accept' | 'dismiss'
  reviewedBy: string
  preferredStartAtUtc?: string
  preferredTimezone?: string
}

export function useRescheduleRequests(initialData?: RescheduleRequest[]) {
  return useQuery<RescheduleRequest[]>({
    queryKey: ['reschedule-requests'],
    queryFn: () => get('/reschedule-requests'),
    ...(initialData ? { initialData } : {}),
  })
}

export function useReviewRescheduleRequest() {
  const queryClient = useQueryClient()
  return useMutation<RescheduleRequest, Error, ReviewRescheduleInput>({
    mutationFn: ({ id, ...body }) => patch(`/reschedule-requests/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
