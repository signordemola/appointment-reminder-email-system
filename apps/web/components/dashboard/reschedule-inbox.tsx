'use client'

import { DateTime } from 'luxon'
import { RefreshCw, Check, X, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { RescheduleRequest } from '@/lib/types'

interface RescheduleInboxProps {
  requests: RescheduleRequest[]
}

export function RescheduleInbox({ requests }: RescheduleInboxProps) {
  const pendingRequests = requests.filter((req) => req.status === 'pending')

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Reschedule Requests</CardTitle>
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {pendingRequests.length}
            </Badge>
          )}
        </div>
        <CardDescription>
          Review and respond to client reschedule requests
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {pendingRequests.length > 0 ? (
          <div className="divide-y">
            {pendingRequests.map((request) => {
              const requestedAt = DateTime.fromJSDate(new Date(request.requestedAt))
              const relativeTime = requestedAt.toRelative()
              
              return (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 text-status-rescheduled" />
                        <p className="font-medium">
                          {request.appointment.contact.name}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.appointment.serviceType}
                      </p>
                      {request.reason && (
                        <p className="mt-2 text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          {request.reason}
                        </p>
                      )}
                      {request.preferredDates && (
                        <p className="mt-1 text-sm">
                          <span className="text-muted-foreground">Preferred: </span>
                          {request.preferredDates}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>Requested {relativeTime}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <X className="mr-1 size-3.5" />
                        Deny
                      </Button>
                      <Button size="sm" className="h-8">
                        <Check className="mr-1 size-3.5" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
              <Check className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">All caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No pending reschedule requests
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
