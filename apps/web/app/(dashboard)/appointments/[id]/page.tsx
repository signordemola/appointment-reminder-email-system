'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DateTime } from 'luxon'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MailCheck,
  MailX,
  Phone,
  User,
  XCircle,
  AlertTriangle,
  Loader2,
  RotateCcw,
} from 'lucide-react'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { get } from '@/lib/api'

interface AppointmentDetail {
  id: string
  title: string
  locationName: string | null
  startsAtUtc: string
  endsAtUtc: string | null
  displayTimezone: string
  status: string
  confirmationStatus: string
  externalReference: string | null
  createdAt: string
  updatedAt: string
  contact: {
    id: string
    fullName: string
    email: string
    phone: string | null
    timezone: string
    emailOptOut: boolean
  }
  reminderEvents: Array<{
    id: string
    eventType: string
    status: string
    scheduledForUtc: string
    processedAt: string | null
    providerMessageId: string | null
    rule: {
      id: string
      name: string
      eventType: string
      offsetMinutes: number
    } | null
  }>
  rescheduleRequests: Array<{
    id: string
    message: string | null
    preferredStartAtUtc: string
    preferredTimezone: string
    status: string
    createdAt: string
    reviewedAt: string | null
    reviewedBy: string | null
  }>
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmed', className: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' },
  canceled: { label: 'Cancelled', className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' },
  no_show: { label: 'No Show', className: 'bg-status-noshow/10 text-status-noshow border-status-noshow/20' },
  completed: { label: 'Completed', className: 'bg-muted text-foreground' },
  reschedule_requested: { label: 'Reschedule Requested', className: 'bg-status-rescheduled/10 text-status-rescheduled border-status-rescheduled/20' },
}

const eventStatusIcons: Record<string, { icon: typeof Mail; color: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground' },
  sent: { icon: Mail, color: 'text-primary' },
  delivered: { icon: MailCheck, color: 'text-status-confirmed' },
  opened: { icon: MailCheck, color: 'text-status-confirmed' },
  clicked: { icon: CheckCircle2, color: 'text-status-confirmed' },
  failed: { icon: MailX, color: 'text-destructive' },
  bounced: { icon: XCircle, color: 'text-destructive' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground' },
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await get<AppointmentDetail>(`/appointments/${id}`)
        setAppointment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointment')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <>
        <Header
          title="Appointment Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Appointments', href: '/appointments' },
            { label: 'Details' },
          ]}
        />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    )
  }

  if (error || !appointment) {
    return (
      <>
        <Header title="Appointment Details" />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error || 'Appointment not found'}</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const appt = appointment
  const startDt = DateTime.fromISO(appt.startsAtUtc).setZone(appt.displayTimezone)
  const endDt = appt.endsAtUtc
    ? DateTime.fromISO(appt.endsAtUtc).setZone(appt.displayTimezone)
    : null
  const duration = endDt ? endDt.diff(startDt, 'minutes').minutes : null
  const initials = appt.contact.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const status = statusConfig[appt.status] ?? statusConfig.scheduled
  const confirmStatus = appt.confirmationStatus === 'confirmed'
    ? { label: 'Confirmed', className: 'bg-status-confirmed/10 text-status-confirmed' }
    : { label: 'Pending', className: 'bg-status-pending/10 text-status-pending' }

  return (
    <>
      <Header
        title="Appointment Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Appointments', href: '/appointments' },
          { label: appt.title },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/appointments')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-6 p-6">

        {/* Top: Appointment + Contact Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 card-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{appt.title}</CardTitle>
                  <CardDescription>
                    {startDt.toFormat('EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn('text-xs', status.className)}>
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', confirmStatus.className)}>
                    {confirmStatus.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {startDt.toFormat('h:mm a')}
                      {endDt ? ` – ${endDt.toFormat('h:mm a')}` : ''}
                      {' '}{startDt.toFormat('ZZZZ')}
                    </p>
                  </div>
                </div>
                {duration && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{duration} minutes</p>
                    </div>
                  </div>
                )}
              </div>
              {appt.locationName && (
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{appt.locationName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{appt.contact.fullName}</p>
                  <p className="text-sm text-muted-foreground">{appt.contact.timezone}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <p className="text-sm">{appt.contact.email}</p>
                </div>
                {appt.contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-muted-foreground" />
                    <p className="text-sm">{appt.contact.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminder Events Timeline */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Reminder Timeline</CardTitle>
            <CardDescription>
              {appt.reminderEvents.length} reminder event{appt.reminderEvents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appt.reminderEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No reminder events yet.</p>
            ) : (
              <div className="space-y-3">
                {appt.reminderEvents.map((event, i) => {
                  const eventDt = DateTime.fromISO(event.scheduledForUtc).setZone(appt.displayTimezone)
                  const processedDt = event.processedAt
                    ? DateTime.fromISO(event.processedAt).setZone(appt.displayTimezone)
                    : null
                  const statusInfo = eventStatusIcons[event.status] ?? eventStatusIcons.pending
                  const StatusIcon = statusInfo.icon

                  return (
                    <div key={event.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className={cn('mt-0.5 shrink-0', statusInfo.color)}>
                        <StatusIcon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium capitalize">
                            {event.eventType.replace(/_/g, ' ')}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.rule?.name ?? 'Manual'} · Scheduled for {eventDt.toFormat('MMM d, h:mm a')}
                        </p>
                        {processedDt && (
                          <p className="text-xs text-muted-foreground">
                            Processed {processedDt.toRelative()}
                          </p>
                        )}
                        {event.providerMessageId && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            ID: {event.providerMessageId}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reschedule Requests */}
        {appt.rescheduleRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="size-4" />
                Reschedule Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appt.rescheduleRequests.map((req) => {
                  const reqDt = DateTime.fromISO(req.createdAt)
                  const prefDt = DateTime.fromISO(req.preferredStartAtUtc).setZone(req.preferredTimezone)
                  const reqStatus = req.status === 'accepted'
                    ? { label: 'Accepted', className: 'bg-status-confirmed/10 text-status-confirmed' }
                    : req.status === 'dismissed'
                    ? { label: 'Dismissed', className: 'bg-status-cancelled/10 text-status-cancelled' }
                    : { label: 'Pending', className: 'bg-status-pending/10 text-status-pending' }

                  return (
                    <div key={req.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Submitted {reqDt.toRelative()}
                        </p>
                        <Badge variant="outline" className={cn('text-xs', reqStatus.className)}>
                          {reqStatus.label}
                        </Badge>
                      </div>
                      {req.message && (
                        <p className="text-sm">&ldquo;{req.message}&rdquo;</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Preferred: {prefDt.toFormat('EEEE, MMM d, h:mm a ZZZZ')}
                      </p>
                      {req.reviewedAt && req.reviewedBy && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed by {req.reviewedBy} · {DateTime.fromISO(req.reviewedAt).toRelative()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
