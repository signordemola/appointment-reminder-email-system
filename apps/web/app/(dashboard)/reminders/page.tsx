'use client'

import { useState } from 'react'
import {
  Bell,
  Clock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
} from 'lucide-react'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'

interface ReminderRule {
  id: string
  name: string
  channel: 'email' | 'sms'
  triggerType: 'before' | 'after'
  triggerHours: number
  templateSubject?: string
  templateBody: string
  isActive: boolean
  sentCount: number
}

const reminderRules: ReminderRule[] = [
  {
    id: '1',
    name: '24-Hour Reminder',
    channel: 'email',
    triggerType: 'before',
    triggerHours: 24,
    templateSubject: 'Reminder: Your appointment is tomorrow',
    templateBody: 'Hi {{contact_name}}, this is a friendly reminder that you have an appointment for {{service_type}} scheduled for {{appointment_date}} at {{appointment_time}}.',
    isActive: true,
    sentCount: 156,
  },
  {
    id: '2',
    name: '2-Hour Reminder',
    channel: 'email',
    triggerType: 'before',
    triggerHours: 2,
    templateSubject: 'Your appointment is in 2 hours',
    templateBody: 'Hi {{contact_name}}, just a quick reminder that your {{service_type}} appointment is coming up in 2 hours at {{appointment_time}}. We look forward to seeing you!',
    isActive: true,
    sentCount: 142,
  },
  {
    id: '3',
    name: 'SMS Day-Before',
    channel: 'sms',
    triggerType: 'before',
    triggerHours: 24,
    templateBody: 'Reminder: You have a {{service_type}} appointment tomorrow at {{appointment_time}}. Reply CONFIRM to confirm or call to reschedule.',
    isActive: true,
    sentCount: 89,
  },
  {
    id: '4',
    name: 'Follow-Up Email',
    channel: 'email',
    triggerType: 'after',
    triggerHours: 24,
    templateSubject: 'How was your appointment?',
    templateBody: 'Hi {{contact_name}}, thank you for visiting us yesterday! We hope you enjoyed your {{service_type}}. We would love to hear your feedback.',
    isActive: false,
    sentCount: 67,
  },
  {
    id: '5',
    name: '1-Week Reminder',
    channel: 'email',
    triggerType: 'before',
    triggerHours: 168,
    templateSubject: 'Your upcoming appointment next week',
    templateBody: 'Hi {{contact_name}}, this is a reminder that you have a {{service_type}} appointment scheduled for {{appointment_date}} at {{appointment_time}}. Mark your calendar!',
    isActive: true,
    sentCount: 45,
  },
]

function formatTriggerTime(hours: number, type: 'before' | 'after') {
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${type}`
  }
  const days = Math.floor(hours / 24)
  if (days === 7) return `1 week ${type}`
  return `${days} day${days > 1 ? 's' : ''} ${type}`
}

export default function RemindersPage() {
  const [rules, setRules] = useState(reminderRules)

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  const activeRules = rules.filter(r => r.isActive)
  const inactiveRules = rules.filter(r => !r.isActive)

  return (
    <>
      <Header
        title="Reminder Rules"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reminder Rules' },
        ]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">New Rule</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Reminder Rule</DialogTitle>
                <DialogDescription>
                  Set up an automated reminder that will be sent to clients.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input id="name" placeholder="e.g., 24-Hour Reminder" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Channel</Label>
                    <Select defaultValue="email">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Trigger</Label>
                    <Select defaultValue="before">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before appointment</SelectItem>
                        <SelectItem value="after">After appointment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Time Offset</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours (1 day)</SelectItem>
                      <SelectItem value="48">48 hours (2 days)</SelectItem>
                      <SelectItem value="168">168 hours (1 week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input id="subject" placeholder="Reminder: Your appointment is coming up" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Message Template</Label>
                  <Textarea 
                    id="body" 
                    rows={4}
                    placeholder="Hi {{contact_name}}, this is a reminder..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {'{{contact_name}}'}, {'{{service_type}}'}, {'{{appointment_date}}'}, {'{{appointment_time}}'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{rules.length}</p>
                  <p className="text-sm text-muted-foreground">Total Rules</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{activeRules.length}</p>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-status-confirmed/10">
                  <Power className="size-5 text-status-confirmed" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {rules.reduce((acc, r) => acc + r.sentCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Reminders Sent</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="size-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-status-confirmed" />
              Active Rules
            </CardTitle>
            <CardDescription>
              These rules are currently sending reminders to your clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex size-10 items-center justify-center rounded-lg',
                      rule.channel === 'email' ? 'bg-primary/10' : 'bg-status-pending/10'
                    )}>
                      {rule.channel === 'email' ? (
                        <Mail className="size-5 text-primary" />
                      ) : (
                        <MessageSquare className="size-5 text-status-pending" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {rule.channel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatTriggerTime(rule.triggerHours, rule.triggerType)}
                        </span>
                        <span>{rule.sentCount} sent</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 size-4" />
                          Edit rule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          Delete rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inactive Rules */}
        {inactiveRules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground" />
                Inactive Rules
              </CardTitle>
              <CardDescription>
                These rules are paused and not sending reminders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        {rule.channel === 'email' ? (
                          <Mail className="size-5 text-muted-foreground" />
                        ) : (
                          <MessageSquare className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rule.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {rule.channel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatTriggerTime(rule.triggerHours, rule.triggerType)}
                          </span>
                          <span>{rule.sentCount} sent</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 size-4" />
                            Edit rule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete rule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
