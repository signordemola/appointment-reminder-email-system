import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '../api'

export interface ReminderRule {
  id: string
  name: string
  active: boolean
  eventType: 'confirmation_request' | 'reminder' | 'follow_up'
  channel: 'email'
  offsetMinutes: number
  templateSubject: string | null
  templateBody: string | null
  sentCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateReminderRuleInput {
  name: string
  eventType: string
  channel: string
  offsetMinutes: number
  templateSubject?: string
  templateBody?: string
}

export function useReminderRules(initialData?: ReminderRule[]) {
  return useQuery<ReminderRule[]>({
    queryKey: ['reminder-rules'],
    queryFn: () => get('/reminder-rules'),
    ...(initialData ? { initialData } : {}),
  })
}

export function useCreateReminderRule() {
  const queryClient = useQueryClient()
  return useMutation<ReminderRule, Error, CreateReminderRuleInput>({
    mutationFn: (input) => post('/reminder-rules', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-rules'] })
    },
  })
}

export function useToggleReminderRule() {
  const queryClient = useQueryClient()
  return useMutation<ReminderRule, Error, { id: string; active: boolean }>({
    mutationFn: ({ id, active }) =>
      patch(`/reminder-rules/${id}`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-rules'] })
    },
  })
}

export function useDeleteReminderRule() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => del(`/reminder-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-rules'] })
    },
  })
}
