'use client'

import { useState, useMemo } from 'react'
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
import { useRescheduleRequests, useReviewRescheduleRequest, type RescheduleRequest as ApiRescheduleRequest } from '@/lib/hooks/use-reschedule'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-status-pending/10 text-status-pending border-status-pending/20' },
  approved: { label: 'Approved', className: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' },
  denied: { label: 'Denied', className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' },
}

interface RescheduleContentProps {
  initialRequests: ApiRescheduleRequest[]
}

export function RescheduleContent({ initialRequests }: RescheduleContentProps) {
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [denyDialogOpen, setDenyDialogOpen] = useState(false)
  const [newDateTime, setNewDateTime] = useState('')
  const [denyReason, setDenyReason] = useState('')

  const { data: apiRequests } = useRescheduleRequests(initialRequests)
  const reviewRequest = useReviewRescheduleRequest()

  const mapApiRequest = (apiReq: ApiRescheduleRequest): RescheduleRequest => ({
    id: apiReq.id,
    client: {
      name: apiReq.appointment.contact.fullName,
      email: apiReq.appointment.contact.email,
      phone: apiReq.appointment.contact.phone || '',
      avatar: null,
      initials: apiReq.appointment.contact.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    },
    originalAppointment: {
      service: apiReq.appointment.title,
      datetime: apiReq.appointment.startsAtUtc,
    },
    reason: apiReq.message || 'No reason provided',
    preferredDates: apiReq.preferredStartAtUtc ? [apiReq.preferredStartAtUtc] : [],
    status: apiReq.status === 'accepted' ? 'approved' : apiReq.status === 'dismissed' ? 'denied' : 'pending',
    submittedAt: apiReq.createdAt,
    adminNotes: apiReq.reviewedBy ? `Reviewed by ${apiReq.reviewedBy}` : undefined,
  })

  const rescheduleRequests = useMemo(() => apiRequests?.map(mapApiRequest) ?? [], [apiRequests])
  const pendingRequests = rescheduleRequests.filter(r => r.status === 'pending')
  const resolvedRequests = rescheduleRequests.filter(r => r.status !== 'pending')

  const handleApprove = async () => {
    if (!selectedRequest || !newDateTime) return
    try {
      await reviewRequest.mutateAsync({
        id: selectedRequest.id,
        decision: 'accept',
        reviewedBy: 'admin',
        preferredStartAtUtc: DateTime.fromISO(newDateTime).toUTC().toISO() ?? undefined,
        preferredTimezone: selectedRequest.originalAppointment.datetime ? DateTime.fromISO(selectedRequest.originalAppointment.datetime).zoneName ?? undefined : undefined,
      })
      toast.success('Request approved successfully')
      setApproveDialogOpen(false)
      setNewDateTime('')
      setSelectedRequest(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve request')
    }
  }

  const handleDeny = async () => {
    if (!selectedRequest) return
    try {
      await reviewRequest.mutateAsync({
        id: selectedRequest.id,
        decision: 'dismiss',
        reviewedBy: 'admin',
      })
      toast.success('Request denied')
      setDenyDialogOpen(false)
      setDenyReason('')
      setSelectedRequest(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deny request')
    }
  }



  const handleAction = (request: RescheduleRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request)
    if (action === 'approve') {
      setApproveDialogOpen(true)
    } else {
      setDenyDialogOpen(true)
    }
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
              {resolvedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">No resolved requests yet.</p>
                  </CardContent>
                </Card>
              ) : (
                resolvedRequests.map((request) => (
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
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Reschedule</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Select a new time for ${selectedRequest.client.name}'s appointment.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-date">New Date</Label>
                <Input type="date" id="new-date" value={newDateTime.split('T')[0]} onChange={(e) => setNewDateTime(e.target.value + 'T' + (newDateTime.split('T')[1] || '09:00'))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-time">New Time</Label>
                <Input type="time" id="new-time" value={newDateTime.split('T')[1] || ''} onChange={(e) => setNewDateTime((newDateTime.split('T')[0] || new Date().toISOString().split('T')[0]) + 'T' + e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this reschedule..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={reviewRequest.isPending}>
              {reviewRequest.isPending ? 'Approving...' : 'Approve & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
            <DialogDescription>
              Add a note explaining why this request is being denied.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deny-reason">Reason</Label>
              <Textarea
                id="deny-reason"
                placeholder="Explain why this request is being denied..."
                rows={3}
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeny} variant="destructive" disabled={reviewRequest.isPending}>
              {reviewRequest.isPending ? 'Denying...' : 'Deny Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
