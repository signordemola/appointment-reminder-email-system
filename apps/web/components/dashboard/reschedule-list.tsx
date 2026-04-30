'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  Calendar,
  User,
  MessageSquare,
  Filter,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RescheduleRequest } from '@/lib/types'

interface RescheduleListProps {
  requests: RescheduleRequest[]
}

function RequestStatusBadge({ status }: { status: RescheduleRequest['status'] }) {
  const config = {
    pending: { label: 'Pending', className: 'bg-status-pending/15 text-status-pending border-status-pending/30' },
    approved: { label: 'Approved', className: 'bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30' },
    denied: { label: 'Denied', className: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30' },
  }

  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function RescheduleList({ requests }: RescheduleListProps) {
  const [localRequests, setLocalRequests] = useState(requests)
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null)
  const [responseNote, setResponseNote] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')

  const filteredRequests = localRequests.filter((req) => {
    if (filterStatus === 'all') return true
    return req.status === filterStatus
  })

  const pendingCount = localRequests.filter((r) => r.status === 'pending').length

  const handleAction = (request: RescheduleRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request)
    setActionType(action)
    setResponseNote('')
  }

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return

    setLocalRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, status: actionType === 'approve' ? 'approved' : 'denied', resolvedAt: new Date() }
          : req
      )
    )
    setSelectedRequest(null)
    setActionType(null)
    setResponseNote('')
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-medium">Reschedule Requests</CardTitle>
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {pendingCount} pending
                  </Badge>
                )}
              </div>
              <CardDescription>
                Review and respond to client reschedule requests
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-1.5 size-4" />
                  {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDown className="ml-1.5 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                  Pending Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('approved')}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('denied')}>
                  Denied
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {filteredRequests.length > 0 ? (
            <div className="divide-y">
              {filteredRequests.map((request) => {
                const requestedAt = DateTime.fromJSDate(new Date(request.requestedAt))
                const relativeTime = requestedAt.toRelative()
                const appointmentDt = DateTime.fromJSDate(new Date(request.appointment.scheduledAt))
                
                return (
                  <div key={request.id} className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                        request.status === 'pending' 
                          ? 'bg-status-rescheduled/10 text-status-rescheduled' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <RefreshCw className="size-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">
                            {request.appointment.contact.name}
                          </p>
                          <RequestStatusBadge status={request.status} />
                        </div>
                        
                        <div className="mt-2 grid gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>
                              Original: {appointmentDt.toFormat('EEE, MMM d')} at {appointmentDt.toFormat('h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="size-4" />
                            <span>{request.appointment.serviceType}</span>
                            {request.appointment.staffName && (
                              <>
                                <span className="text-muted-foreground/50">|</span>
                                <span>{request.appointment.staffName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {request.reason && (
                          <div className="mt-3 rounded-lg bg-muted/50 p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Reason for reschedule
                                </p>
                                <p className="text-sm">{request.reason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.preferredDates && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Clock className="size-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Preferred:</span>
                            <span>{request.preferredDates}</span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>Requested {relativeTime}</span>
                          {request.resolvedAt && (
                            <>
                              <span className="mx-1">|</span>
                              <span>
                                Resolved {DateTime.fromJSDate(new Date(request.resolvedAt)).toRelative()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex shrink-0 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAction(request, 'deny')}
                          >
                            <X className="mr-1 size-3.5" />
                            Deny
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAction(request, 'approve')}
                          >
                            <Check className="mr-1 size-3.5" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                <Check className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No requests found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filterStatus === 'all' 
                  ? 'No reschedule requests yet'
                  : `No ${filterStatus} requests`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Deny'} Reschedule Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Approving will notify the client that you accept their reschedule request.'
                : 'Denying will notify the client that their request cannot be accommodated.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="rounded-lg border p-4 mb-4">
                <p className="font-medium">{selectedRequest.appointment.contact.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.appointment.serviceType}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="response">Response note (optional)</Label>
                <Textarea
                  id="response"
                  placeholder={actionType === 'approve' 
                    ? "We'll contact you shortly to confirm the new time..."
                    : "Unfortunately we cannot accommodate this request..."
                  }
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              variant={actionType === 'deny' ? 'destructive' : 'default'}
            >
              {actionType === 'approve' ? 'Approve Request' : 'Deny Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
