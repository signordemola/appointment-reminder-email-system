'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DateTime } from 'luxon'
import { CheckCircle2, Calendar, Clock, MapPin, Loader2, XCircle, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface ConfirmResult {
  appointmentId: string
  status: string
  confirmationStatus: string
  confirmedAt: string
}

type PageState = 'loading' | 'preview' | 'confirmed' | 'already_confirmed' | 'error'

export default function ConfirmPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PageState>('loading')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await get<PreviewResponse>(`/actions/confirm/${token}`)
        if (data.appointment.confirmationStatus === 'confirmed') {
          setState('already_confirmed')
        } else {
          setState('preview')
        }
        setPreview(data)
      } catch (err) {
        setState('error')
        if (err instanceof ApiError) {
          if (err.status === 404 || err.status === 410) {
            setErrorMessage('This confirmation link has expired or has already been used.')
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

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await post<ConfirmResult>(`/actions/confirm/${token}`, {})
      setState('confirmed')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to confirm. Please try again.')
      }
      setState('error')
    } finally {
      setConfirming(false)
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
          <CardTitle className="text-xl">Unable to Confirm</CardTitle>
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

  if (state === 'confirmed') {
    const appt = preview!.appointment
    const startDt = DateTime.fromISO(appt.startsAtUtc).setZone(appt.displayTimezone)
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-status-confirmed/10">
            <CheckCircle2 className="size-8 text-status-confirmed" />
          </div>
          <CardTitle className="text-xl">You&apos;re Confirmed!</CardTitle>
          <CardDescription>
            Thanks, {appt.contact.fullName}! We&apos;ll see you soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
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
              <p className="text-sm">{startDt.toFormat('h:mm a ZZZZ')}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            A confirmation email has been sent to {appt.contact.email}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (state === 'already_confirmed') {
    const appt = preview!.appointment
    const startDt = DateTime.fromISO(appt.startsAtUtc).setZone(appt.displayTimezone)
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-status-confirmed/10">
            <CheckCircle2 className="size-8 text-status-confirmed" />
          </div>
          <CardTitle className="text-xl">Already Confirmed</CardTitle>
          <CardDescription>
            This appointment has already been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
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
              <p className="text-sm">{startDt.toFormat('h:mm a ZZZZ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // state === 'preview'
  const appt = preview!.appointment
  const startDt = DateTime.fromISO(appt.startsAtUtc).setZone(appt.displayTimezone)
  const endDt = appt.endsAtUtc
    ? DateTime.fromISO(appt.endsAtUtc).setZone(appt.displayTimezone)
    : null

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="size-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Confirm Your Appointment</CardTitle>
        <CardDescription>
          Hi {appt.contact.fullName}, please confirm your upcoming appointment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
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

        <Button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full"
          size="lg"
        >
          {confirming ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 size-4" />
              Confirm Attendance
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Can&apos;t make it? Contact us to reschedule.
        </p>
      </CardContent>
    </Card>
  )
}
