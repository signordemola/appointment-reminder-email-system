import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '../api'

export interface RescheduleRequest {
  id: string
  appointmentId: string
  reason: string
  preferredStartAtUtc: string | null
  preferredTimezone: string | null
  status: 'pending' | 'accepted' | 'dismissed'
  reviewedAt: string | null
  reviewedBy: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  appointment: {
    title: string
    startsAtUtc: string
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

export function useRescheduleRequests() {
  return useQuery<RescheduleRequest[]>({
    queryKey: ['reschedule-requests'],
    queryFn: () => get('/reschedule-requests'),
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
