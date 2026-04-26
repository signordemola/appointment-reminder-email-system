import { cache } from "react"

type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "reschedule_requested"
  | "canceled"
  | "completed"
  | "no_show"

type ConfirmationStatus = "pending" | "confirmed" | "expired" | "skipped"

type Contact = {
  id: string
  fullName: string
  email: string
  phone: string | null
  timezone: string
  emailOptOut: boolean
}

type ReminderRule = {
  id: string
  name: string
  channel: "email"
  eventType: "confirmation_request" | "reminder" | "follow_up"
  offsetMinutes: number
  active: boolean
}

type ReminderEvent = {
  id: string
  appointmentId: string
  ruleId: string | null
  channel: "email"
  eventType: "confirmation_request" | "reminder" | "follow_up"
  scheduledForUtc: string
  status:
    | "pending"
    | "locked"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed"
    | "canceled"
    | "skipped"
  provider: string | null
  providerMessageId: string | null
  lockedAt: string | null
  processedAt: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  rule?: ReminderRule | null
}

type RescheduleRequest = {
  id: string
  appointmentId: string
  preferredStartAtUtc: string
  preferredTimezone: string
  message: string | null
  status: "pending" | "accepted" | "dismissed"
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
  appointment: AppointmentListItem
}

type AiRescheduleTriage = {
  urgency: "low" | "medium" | "high"
  likelyReasonCategory:
    | "schedule_conflict"
    | "transportation"
    | "health_issue"
    | "work_conflict"
    | "family_conflict"
    | "weather"
    | "pricing_or_financial"
    | "forgot"
    | "needs_more_information"
    | "other"
  confidence: "low" | "medium" | "high"
  recommendedAction:
    | "accept_requested_time"
    | "offer_alternatives"
    | "contact_client"
    | "dismiss_request"
  needsHumanFollowUp: boolean
  operationalRisk: "none" | "watch" | "urgent"
  adminSummary: string
  suggestedReply: string
  riskFlags: string[]
}

type RescheduleTriageResult = {
  generatedAt: string
  rescheduleRequestId: string
  appointmentId: string
  provider: "gemini"
  model: string
  triage: AiRescheduleTriage
}

type AppointmentListItem = {
  id: string
  contactId: string
  title: string
  locationName: string | null
  startsAtUtc: string
  endsAtUtc: string | null
  displayTimezone: string
  status: AppointmentStatus
  confirmationStatus: ConfirmationStatus
  externalReference: string | null
  createdAt: string
  updatedAt: string
  contact: Contact
}

type AppointmentDetail = AppointmentListItem & {
  reminderEvents: ReminderEvent[]
  rescheduleRequests: Array<Omit<RescheduleRequest, "appointment">>
}

type ActionAppointmentPreview = {
  id: string
  title: string
  startsAtUtc: string
  endsAtUtc: string | null
  displayTimezone: string
  status: AppointmentStatus
  confirmationStatus: ConfirmationStatus
  contact: Pick<Contact, "fullName" | "email" | "timezone">
}

type ActionPreview = {
  actionType: "confirm" | "reschedule"
  expiresAt: string
  appointment: ActionAppointmentPreview
}

type AppointmentsResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: AppointmentListItem[]
}

type DashboardSummary = {
  generatedAt: string
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
  reminderActivity: Array<{
    day: string
    sent: number
    failed: number
    bounced: number
  }>
}

type CreateAppointmentInput = {
  fullName: string
  email: string
  phone?: string | null
  contactTimezone: string
  emailOptOut: boolean
  title: string
  locationName?: string | null
  startsAtUtc: string
  endsAtUtc?: string | null
  displayTimezone: string
  externalReference?: string | null
}

type ReviewRescheduleRequestInput = {
  decision: "accept" | "dismiss"
  reviewedBy: string
}

type ConfirmAppointmentResult = {
  appointmentId: string
  status: AppointmentStatus
  confirmationStatus: ConfirmationStatus
  confirmedAt: string
}

type CreateRescheduleRequestFromTokenInput = {
  preferredStartAtUtc: string
  preferredTimezone: string
  message?: string | null
}

type CreateRescheduleRequestFromTokenResult = {
  appointmentId: string
  request: Omit<RescheduleRequest, "appointment">
}

type CsvImportWarning = {
  row: number
  message: string
}

type CsvImportImportedRow = {
  row: number
  appointmentId: string
  contactId: string
  status: AppointmentStatus
  confirmationStatus: ConfirmationStatus
  plannedEventCount: number
}

type CsvImportResult = {
  totalRows: number
  importedCount: number
  errorCount: number
  warningCount: number
  imported: CsvImportImportedRow[]
  errors: CsvImportWarning[]
  warnings: CsvImportWarning[]
}

type DispatchDueRemindersItem = {
  reminderEventId: string
  appointmentId: string
  status:
    | "pending"
    | "locked"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed"
    | "canceled"
    | "skipped"
  providerMessageId: string | null
  eventType: "confirmation_request" | "reminder" | "follow_up"
  errorMessage?: string
}

type DispatchDueRemindersResult = {
  recoveredLocks: number
  claimedCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  canceledCount: number
  items: DispatchDueRemindersItem[]
}

type ApiInit = RequestInit & {
  next?: NextFetchRequestConfig
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "")
}

function buildQueryString(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ""
}

async function apiFetch<T>(path: string, init?: ApiInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = "Request failed."

    try {
      const data = (await response.json()) as { message?: string }
      message = data.message ?? message
    } catch {}

    throw new Error(message)
  }

  return (await response.json()) as T
}

type AppointmentsQuery = {
  page?: number
  pageSize?: number
  search?: string | null
  status?: AppointmentStatus | null
  confirmationStatus?: ConfirmationStatus | null
}

const fetchDashboardSummary = cache(() =>
  apiFetch<DashboardSummary>("/dashboard/summary")
)

async function fetchAppointments(query: AppointmentsQuery) {
  return apiFetch<AppointmentsResponse>(
    `/appointments${buildQueryString({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search ?? undefined,
      status: query.status ?? undefined,
      confirmationStatus: query.confirmationStatus ?? undefined,
    })}`,
  )
}

const fetchAppointment = cache((appointmentId: string) =>
  apiFetch<AppointmentDetail>(`/appointments/${appointmentId}`)
)

const fetchRescheduleRequests = cache(() =>
  apiFetch<RescheduleRequest[]>("/reschedule-requests")
)

async function createAppointment(input: CreateAppointmentInput) {
  return apiFetch<AppointmentDetail>(`/appointments`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

const fetchReminderRules = cache(() => apiFetch<ReminderRule[]>("/reminder-rules"))

async function updateReminderRule(
  reminderRuleId: string,
  input: Partial<Pick<ReminderRule, "name" | "offsetMinutes" | "active">>,
) {
  return apiFetch<ReminderRule>(`/reminder-rules/${reminderRuleId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

async function importAppointmentsCsv(file: File) {
  const formData = new FormData()
  formData.set("file", file)

  const response = await fetch(`${getApiBaseUrl()}/appointments/import`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    let message = "CSV import failed."

    try {
      const data = (await response.json()) as { message?: string }
      message = data.message ?? message
    } catch {}

    throw new Error(message)
  }

  return (await response.json()) as CsvImportResult
}

async function fetchConfirmPreview(token: string) {
  return apiFetch<ActionPreview>(`/actions/confirm/${encodeURIComponent(token)}`)
}

async function confirmAppointmentByToken(token: string) {
  return apiFetch<ConfirmAppointmentResult>(`/actions/confirm/${encodeURIComponent(token)}`, {
    method: "POST",
  })
}

async function fetchReschedulePreview(token: string) {
  return apiFetch<ActionPreview>(`/actions/reschedule/${encodeURIComponent(token)}`)
}

async function createRescheduleRequestFromToken(
  token: string,
  input: CreateRescheduleRequestFromTokenInput,
) {
  return apiFetch<CreateRescheduleRequestFromTokenResult>(
    `/actions/reschedule/${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
}

async function reviewRescheduleRequest(
  rescheduleRequestId: string,
  input: ReviewRescheduleRequestInput,
) {
  return apiFetch(`/reschedule-requests/${rescheduleRequestId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

async function generateRescheduleTriage(rescheduleRequestId: string) {
  return apiFetch<RescheduleTriageResult>(`/ai/reschedule-triage`, {
    method: "POST",
    body: JSON.stringify({
      rescheduleRequestId,
    }),
  })
}

export type {
  AiRescheduleTriage,
  ActionAppointmentPreview,
  ActionPreview,
  AppointmentDetail,
  AppointmentListItem,
  AppointmentStatus,
  AppointmentsResponse,
  CsvImportResult,
  DispatchDueRemindersResult,
  ConfirmAppointmentResult,
  ConfirmationStatus,
  Contact,
  CreateAppointmentInput,
  CreateRescheduleRequestFromTokenInput,
  CreateRescheduleRequestFromTokenResult,
  DashboardSummary,
  ReminderEvent,
  ReminderRule,
  RescheduleTriageResult,
  RescheduleRequest,
}
export {
  confirmAppointmentByToken,
  createAppointment,
  createRescheduleRequestFromToken,
  fetchAppointment,
  fetchAppointments,
  fetchConfirmPreview,
  fetchDashboardSummary,
  fetchReminderRules,
  fetchReschedulePreview,
  fetchRescheduleRequests,
  generateRescheduleTriage,
  getApiBaseUrl,
  importAppointmentsCsv,
  reviewRescheduleRequest,
  updateReminderRule,
}
