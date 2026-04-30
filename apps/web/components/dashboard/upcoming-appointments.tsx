'use client'

import { DateTime } from 'luxon'
import { Clock, User, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import type { Appointment } from '@/lib/types'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  // Filter to only show today's and tomorrow's scheduled/confirmed appointments
  const now = DateTime.now()
  const endOfTomorrow = now.plus({ days: 1 }).endOf('day')
  
  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = DateTime.fromJSDate(new Date(apt.scheduledAt))
      return (
        aptDate > now &&
        aptDate <= endOfTomorrow &&
        (apt.status === 'scheduled' || apt.status === 'confirmed')
      )
    })
    .sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(0, 5)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Coming Up</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {upcomingAppointments.length > 0 ? (
          <div className="divide-y">
            {upcomingAppointments.map((appointment) => {
              const dt = DateTime.fromJSDate(new Date(appointment.scheduledAt))
              const isToday = dt.hasSame(now, 'day')
              
              return (
                <div 
                  key={appointment.id} 
                  className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {appointment.contact.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {appointment.serviceType}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {dt.toFormat('h:mm a')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isToday ? 'Today' : 'Tomorrow'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming appointments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
