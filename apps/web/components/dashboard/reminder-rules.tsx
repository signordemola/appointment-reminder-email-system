'use client'

import { useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { ReminderRule, ReminderChannel, ReminderTrigger } from '@/lib/types'

interface ReminderRulesProps {
  rules: ReminderRule[]
}

function formatOffset(minutes: number): string {
  if (minutes >= 24 * 60) {
    const days = Math.floor(minutes / (24 * 60))
    return `${days} day${days > 1 ? 's' : ''} before`
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} before`
  }
  return `${minutes} min before`
}

function ChannelIcon({ channel }: { channel: ReminderChannel }) {
  if (channel === 'email') {
    return <Mail className="size-4" />
  }
  return <MessageSquare className="size-4" />
}

export function ReminderRules({ rules }: ReminderRulesProps) {
  const [localRules, setLocalRules] = useState(rules)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const toggleRule = (ruleId: string) => {
    setLocalRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    )
  }

  const activeRules = localRules.filter((r) => r.isActive)
  const inactiveRules = localRules.filter((r) => !r.isActive)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-base font-medium">Reminder Rules</CardTitle>
          <CardDescription>
            Configure when and how reminder emails are sent to clients
          </CardDescription>
        </div>
        <CardAction>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 size-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Reminder Rule</DialogTitle>
                <DialogDescription>
                  Set up a new automated reminder for your appointments
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
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="size-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="size-4" />
                            SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Trigger</Label>
                    <Select defaultValue="before_appointment">
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before_appointment">Before appointment</SelectItem>
                        <SelectItem value="after_no_confirmation">After no confirmation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Time Offset</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="24" className="w-24" />
                    <Select defaultValue="hours">
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Reminder: Your appointment is coming up"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    placeholder="Hi {{contact_name}}, this is a reminder..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {"{{contact_name}}"}, {"{{service_type}}"}, {"{{appointment_date}}"}, {"{{appointment_time}}"}, {"{{confirmation_link}}"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>
                  Create Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {/* Active Rules */}
        {activeRules.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 px-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active Rules ({activeRules.length})
              </h3>
            </div>
            <div className="divide-y">
              {activeRules.map((rule) => (
                <RuleItem 
                  key={rule.id} 
                  rule={rule} 
                  onToggle={() => toggleRule(rule.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Rules */}
        {inactiveRules.length > 0 && (
          <div>
            <div className="mb-2 px-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Inactive Rules ({inactiveRules.length})
              </h3>
            </div>
            <div className="divide-y">
              {inactiveRules.map((rule) => (
                <RuleItem 
                  key={rule.id} 
                  rule={rule} 
                  onToggle={() => toggleRule(rule.id)}
                />
              ))}
            </div>
          </div>
        )}

        {localRules.length === 0 && (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No reminder rules</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first reminder rule to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RuleItemProps {
  rule: ReminderRule
  onToggle: () => void
}

function RuleItem({ rule, onToggle }: RuleItemProps) {
  return (
    <div 
      className={`flex items-center gap-4 px-6 py-4 transition-opacity ${
        !rule.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
        rule.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <ChannelIcon channel={rule.channel} />
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{rule.name}</p>
          <Badge variant="outline" className="text-xs">
            {rule.channel.toUpperCase()}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{formatOffset(rule.offsetMinutes)}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="capitalize">
            {rule.trigger.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Switch
          checked={rule.isActive}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${rule.name}`}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 size-4" />
              Edit Rule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggle}>
              {rule.isActive ? (
                <>
                  <PowerOff className="mr-2 size-4" />
                  Disable
                </>
              ) : (
                <>
                  <Power className="mr-2 size-4" />
                  Enable
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete Rule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
