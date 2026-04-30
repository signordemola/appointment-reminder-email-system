'use client'

import { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Phone,
  X,
} from 'lucide-react'
import { DateTime } from 'luxon'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface RescheduleRequest {
  id: string
  client: {
    name: string
    email: string
    phone: string
    avatar: string | null
    initials: string
  }
  originalAppointment: {
    service: string
    datetime: string
  }
  reason: string
  preferredDates: string[]
  status: 'pending' | 'approved' | 'denied'
  submittedAt: string
  resolvedAt?: string
  adminNotes?: string
}

const rescheduleRequests: RescheduleRequest[] = [
  {
    id: '1',
    client: { name: 'David Kim', email: 'david@example.com', phone: '+1 (555) 678-9012', avatar: null, initials: 'DK' },
    originalAppointment: {
      service: 'Deep Tissue Massage',
      datetime: DateTime.now().plus({ days: 2 }).set({ hour: 14, minute: 0 }).toISO()!,
    },
    reason: 'Work conflict - have a meeting that was just scheduled. Would appreciate an earlier time slot if possible.',
    preferredDates: [
      DateTime.now().plus({ days: 2 }).set({ hour: 10, minute: 0 }).toISO()!,
      DateTime.now().plus({ days: 3 }).set({ hour: 14, minute: 0 }).toISO()!,
    ],
    status: 'pending',
    submittedAt: DateTime.now().minus({ hours: 2 }).toISO()!,
  },
  {
    id: '2',
    client: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 (555) 111-2222', avatar: null, initials: 'SJ' },
    originalAppointment: {
      service: 'Swedish Massage',
      datetime: DateTime.now().plus({ days: 1 }).set({ hour: 11, minute: 0 }).toISO()!,
    },
    reason: 'Feeling under the weather today, would like to reschedule to next week when I am feeling better.',
    preferredDates: [
      DateTime.now().plus({ days: 7 }).set({ hour: 11, minute: 0 }).toISO()!,
      DateTime.now().plus({ days: 8 }).set({ hour: 14, minute: 0 }).toISO()!,
    ],
    status: 'pending',
    submittedAt: DateTime.now().minus({ hours: 5 }).toISO()!,
  },
  {
    id: '3',
    client: { name: 'Mike Thompson', email: 'mike@example.com', phone: '+1 (555) 333-4444', avatar: null, initials: 'MT' },
    originalAppointment: {
      service: 'Hot Stone Therapy',
      datetime: DateTime.now().plus({ days: 3 }).set({ hour: 16, minute: 0 }).toISO()!,
    },
    reason: 'Car trouble, need to take it to the shop that day. Any day next week works for me.',
    preferredDates: [],
    status: 'pending',
    submittedAt: DateTime.now().minus({ hours: 8 }).toISO()!,
  },
  {
    id: '4',
    client: { name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 (555) 123-4567', avatar: null, initials: 'EW' },
    originalAppointment: {
      service: 'Aromatherapy',
      datetime: DateTime.now().minus({ days: 3 }).set({ hour: 10, minute: 0 }).toISO()!,
    },
    reason: 'Family emergency came up unexpectedly.',
    preferredDates: [
      DateTime.now().plus({ days: 1 }).set({ hour: 10, minute: 0 }).toISO()!,
    ],
    status: 'approved',
    submittedAt: DateTime.now().minus({ days: 4 }).toISO()!,
    resolvedAt: DateTime.now().minus({ days: 3, hours: 12 }).toISO()!,
    adminNotes: 'Rescheduled to tomorrow at 10 AM as requested.',
  },
  {
    id: '5',
    client: { name: 'James Chen', email: 'james@example.com', phone: '+1 (555) 234-5678', avatar: null, initials: 'JC' },
    originalAppointment: {
      service: 'Sports Massage',
      datetime: DateTime.now().minus({ days: 5 }).set({ hour: 15, minute: 0 }).toISO()!,
    },
    reason: 'No longer need the appointment.',
    preferredDates: [],
    status: 'denied',
    submittedAt: DateTime.now().minus({ days: 6 }).toISO()!,
    resolvedAt: DateTime.now().minus({ days: 5, hours: 6 }).toISO()!,
    adminNotes: 'Client cancelled instead of rescheduling. Within 24-hour policy.',
  },
]

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-status-pending/10 text-status-pending border-status-pending/20' },
  approved: { label: 'Approved', className: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' },
  denied: { label: 'Denied', className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' },
}

export default function ReschedulePage() {
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'deny'>('approve')

  const pendingRequests = rescheduleRequests.filter(r => r.status === 'pending')
  const resolvedRequests = rescheduleRequests.filter(r => r.status !== 'pending')

  const handleAction = (request: RescheduleRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request)
    setActionType(action)
    setDialogOpen(true)
  }

  return (
    <>
      <Header
        title="Reschedule Requests"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reschedule Requests' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-status-pending">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-status-pending/10">
                  <Clock className="size-5 text-status-pending" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {resolvedRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved This Week</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-status-confirmed/10">
                  <Check className="size-5 text-status-confirmed" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {resolvedRequests.filter(r => r.status === 'denied').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Denied This Week</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-status-cancelled/10">
                  <X className="size-5 text-status-cancelled" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="flex-1">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="size-5 rounded-full p-0 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <Check className="size-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-medium">All caught up!</p>
                    <p className="text-sm text-muted-foreground">No pending reschedule requests.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="size-12">
                            <AvatarImage src={request.client.avatar ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {request.client.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{request.client.name}</p>
                              <Badge variant="outline" className={statusConfig.pending.className}>
                                {statusConfig.pending.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{request.client.email}</p>
                            
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                              <p className="text-sm font-medium">Original Appointment</p>
                              <p className="text-sm">
                                {request.originalAppointment.service} — {' '}
                                {DateTime.fromISO(request.originalAppointment.datetime).toFormat('EEE, MMM d')} at{' '}
                                {DateTime.fromISO(request.originalAppointment.datetime).toFormat('h:mm a')}
                              </p>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm font-medium">Reason</p>
                              <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>

                            {request.preferredDates.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium">Preferred Times</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {request.preferredDates.map((date, i) => (
                                    <Badge key={i} variant="outline" className="font-normal">
                                      {DateTime.fromISO(date).toFormat('EEE, MMM d')} at{' '}
                                      {DateTime.fromISO(date).toFormat('h:mm a')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="mt-3 text-xs text-muted-foreground">
                              Submitted {DateTime.fromISO(request.submittedAt).toRelative()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-row gap-2 lg:flex-col">
                          <Button
                            size="sm"
                            onClick={() => handleAction(request, 'approve')}
                            className="gap-1"
                          >
                            <Check className="size-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(request, 'deny')}
                            className="gap-1"
                          >
                            <X className="size-4" />
                            Deny
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Phone className="mr-2 size-4" />
                                Call client
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 size-4" />
                                Send message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Calendar className="mr-2 size-4" />
                                View calendar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            <div className="space-y-4">
              {resolvedRequests.map((request) => (
                <Card key={request.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-10">
                        <AvatarImage src={request.client.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {request.client.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{request.client.name}</p>
                          <Badge variant="outline" className={statusConfig[request.status].className}>
                            {statusConfig[request.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.originalAppointment.service} — {' '}
                          {DateTime.fromISO(request.originalAppointment.datetime).toFormat('MMM d, h:mm a')}
                        </p>
                        {request.adminNotes && (
                          <p className="mt-2 text-sm text-muted-foreground italic">
                            Note: {request.adminNotes}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Resolved {DateTime.fromISO(request.resolvedAt!).toRelative()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Reschedule' : 'Deny Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Select a new time for ${selectedRequest?.client.name}'s appointment.`
                : `Add a note explaining why this request is being denied.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {actionType === 'approve' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-date">New Date</Label>
                  <Input type="date" id="new-date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-time">New Time</Label>
                  <Input type="time" id="new-time" />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Notes (optional)' : 'Reason'}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === 'approve'
                    ? 'Add any notes about this reschedule...'
                    : 'Explain why this request is being denied...'
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              variant={actionType === 'deny' ? 'destructive' : 'default'}
            >
              {actionType === 'approve' ? 'Approve & Notify' : 'Deny Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
