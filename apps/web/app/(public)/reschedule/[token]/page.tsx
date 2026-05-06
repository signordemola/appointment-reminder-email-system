'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DateTime } from 'luxon'
import {
  Calendar,
  Clock,
  Loader2,
  XCircle,
  CheckCircle2,
  CalendarClock,
  MessageSquare,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { get, post, ApiError } from '@/lib/api'

interface AppointmentPreview {
  id: string
  title: string
  startsAtUtc: string
  endsAtUtc: string | null
  displayTimezone: string
  status: string
  confirmationStatus: string
  contact: {
    fullName: string
    email: string
    timezone: string
  }
}

interface PreviewResponse {
  actionType: string
  expiresAt: string
  appointment: AppointmentPreview
}

type PageState = 'loading' | 'form' | 'submitted' | 'error'

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
]

export default function ReschedulePage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PageState>('loading')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form fields
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [preferredTimezone, setPreferredTimezone] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await get<PreviewResponse>(`/actions/reschedule/${token}`)
        setPreview(data)
        setPreferredTimezone(data.appointment.contact.timezone || 'America/New_York')
        setState('form')
      } catch (err) {
        setState('error')
        if (err instanceof ApiError) {
          if (err.status === 404 || err.status === 410) {
            setErrorMessage('This reschedule link has expired or has already been used.')
          } else {
            setErrorMessage(err.message)
          }
        } else {
          setErrorMessage('Something went wrong. Please try again later.')
        }
      }
    }
    loadPreview()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferredDate || !preferredTime) return

    setSubmitting(true)
    try {
      const preferredStartAtUtc = DateTime
        .fromISO(`${preferredDate}T${preferredTime}`, { zone: preferredTimezone })
        .toUTC()
        .toISO()

      await post(`/actions/reschedule/${token}`, {
        preferredStartAtUtc,
        preferredTimezone,
        ...(message ? { message } : {}),
      })
      setState('submitted')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to submit request. Please try again.')
      }
      setState('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Unable to Reschedule</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact us directly.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (state === 'submitted') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-status-confirmed/10">
            <CheckCircle2 className="size-8 text-status-confirmed" />
          </div>
          <CardTitle className="text-xl">Request Submitted!</CardTitle>
          <CardDescription>
            Thanks, {preview!.appointment.contact.fullName}! We&apos;ve received your reschedule request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Our team will review your request and get back to you shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive an email at{' '}
              <span className="font-medium text-foreground">
                {preview!.appointment.contact.email}
              </span>{' '}
              once a decision is made.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // state === 'form'
  const appt = preview!.appointment
  const startDt = DateTime.fromISO(appt.startsAtUtc).setZone(appt.displayTimezone)
  const endDt = appt.endsAtUtc
    ? DateTime.fromISO(appt.endsAtUtc).setZone(appt.displayTimezone)
    : null

  // Default preferred date to tomorrow
  const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarClock className="size-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Reschedule Appointment</CardTitle>
        <CardDescription>
          Hi {appt.contact.fullName}, let us know when works better for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Current appointment info */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current Appointment
          </p>
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">{appt.title}</p>
              <p className="text-sm text-muted-foreground">
                {startDt.toFormat('EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-muted-foreground shrink-0" />
            <p className="text-sm">
              {startDt.toFormat('h:mm a')}
              {endDt ? ` – ${endDt.toFormat('h:mm a')}` : ''}
              {' '}{startDt.toFormat('ZZZZ')}
            </p>
          </div>
        </div>

        {/* Reschedule form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preferred New Time
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={tomorrow}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={preferredTimezone} onValueChange={setPreferredTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Additional Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Let us know why you need to reschedule or any preferences..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !preferredDate || !preferredTime}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CalendarClock className="mr-2 size-4" />
                Submit Reschedule Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
