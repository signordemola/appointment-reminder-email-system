import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from '../api'

// ── Reschedule Triage ────────────────────────────────────

export interface AiTriageResult {
  rescheduleRequestId: string
  appointmentId: string
  provider: string
  model: string
  generatedAt: string
  triage: {
    urgency: 'low' | 'medium' | 'high'
    likelyReasonCategory: string
    confidence: string
    recommendedAction: string
    needsHumanFollowUp: boolean
    operationalRisk: string
    adminSummary: string
    suggestedReply: string
    riskFlags: string[]
  }
}

export function useAiTriage() {
  const queryClient = useQueryClient()
  return useMutation<AiTriageResult, Error, string>({
    mutationFn: (rescheduleRequestId: string) =>
      post('/ai/reschedule-triage', { rescheduleRequestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] })
    },
  })
}

// ── Reminder Copy Generation ─────────────────────────────

export interface ReminderCopyDraft {
  subject: string
  previewText: string
  bodyText: string
  rationale: string
  placeholdersUsed: string[]
}

export interface ReminderCopyResult {
  provider: string
  model: string
  draft: ReminderCopyDraft
}

export interface GenerateReminderCopyInput {
  reminderRuleId?: string
  ruleName?: string
  eventType?: string
  offsetMinutes?: number
  businessName: string
  businessType: string
  senderName: string
  tone: 'warm' | 'concise' | 'formal'
  includeLocation?: boolean
  includeRescheduleOption?: boolean
  additionalInstructions?: string
}

export function useGenerateReminderCopy() {
  return useMutation<ReminderCopyResult, Error, GenerateReminderCopyInput>({
    mutationFn: (input) => post('/ai/reminder-copy', input),
  })
}
