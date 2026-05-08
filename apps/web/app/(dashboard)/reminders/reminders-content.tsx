'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Bell,
  Clock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Sparkles,
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
import { useReminderRules, useCreateReminderRule, useToggleReminderRule, useDeleteReminderRule, type ReminderRule as ApiReminderRule } from '@/lib/hooks/use-reminders'
import { useGenerateReminderCopy } from '@/lib/hooks/use-ai'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const reminderFormSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  channel: z.enum(['email', 'sms']),
  triggerType: z.enum(['before', 'after']),
  offsetHours: z.string().min(1, 'Please select a time offset'),
  templateSubject: z.string().optional(),
  templateBody: z.string().min(1, 'Message template is required'),
})

type ReminderFormValues = z.infer<typeof reminderFormSchema>

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

function mapApiReminderRule(apiRule: ApiReminderRule): ReminderRule {
  let triggerType: 'before' | 'after' = 'before'
  if (apiRule.eventType === 'follow_up') {
    triggerType = 'after'
  } else if (apiRule.eventType === 'reminder' && apiRule.offsetMinutes > 0) {
    triggerType = 'after'
  } else {
    triggerType = 'before'
  }

  return {
    id: apiRule.id,
    name: apiRule.name,
    channel: apiRule.channel === 'email' ? 'email' : 'sms',
    triggerType,
    triggerHours: Math.abs(apiRule.offsetMinutes) / 60,
    templateSubject: apiRule.templateSubject ?? undefined,
    templateBody: apiRule.templateBody ?? '',
    isActive: apiRule.active,
    sentCount: apiRule.sentCount,
  }
}

function formatTriggerTime(hours: number, type: 'before' | 'after') {
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${type}`
  }
  const days = Math.floor(hours / 24)
  if (days === 7) return `1 week ${type}`
  return `${days} day${days > 1 ? 's' : ''} ${type}`
}

interface RemindersContentProps {
  initialRules: ApiReminderRule[]
}

export function RemindersContent({ initialRules }: RemindersContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      name: '',
      channel: 'email',
      triggerType: 'before',
      offsetHours: '24',
      templateSubject: '',
      templateBody: '',
    },
  })

  const { data: apiRules } = useReminderRules(initialRules)
  const createRule = useCreateReminderRule()
  const toggleRule = useToggleReminderRule()
  const deleteRule = useDeleteReminderRule()

  const rules = useMemo(() => apiRules?.map(mapApiReminderRule) ?? [], [apiRules])
  const activeRules = rules.filter(r => r.isActive)
  const inactiveRules = rules.filter(r => !r.isActive)

  const generateCopy = useGenerateReminderCopy()
  const [aiLoading, setAiLoading] = useState(false)

  const handleToggleRule = async (id: string, currentActive: boolean) => {
    try {
      await toggleRule.mutateAsync({ id, active: !currentActive })
      toast.success(currentActive ? 'Rule deactivated' : 'Rule activated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle rule')
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteRule.mutateAsync(id)
      toast.success('Rule deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete rule')
    }
  }

  const handleCreateRule = async (values: ReminderFormValues) => {
    const offsetMinutes = Number(values.offsetHours) * 60 * (values.triggerType === 'before' ? -1 : 1)
    const eventType = values.triggerType === 'before' ? 'reminder' : 'follow_up'
    try {
      await createRule.mutateAsync({
        name: values.name,
        eventType,
        channel: values.channel,
        offsetMinutes,
        templateSubject: values.templateSubject || undefined,
        templateBody: values.templateBody,
      })
      toast.success('Rule created successfully')
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create rule')
    }
  }



  return (
    <>
      <Header
        title="Reminder Rules"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reminder Rules' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* ── Page Heading ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Reminder Rules</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Automate client reminders with customizable scheduling rules.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) form.reset() }}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto sm:ml-0">
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">New Rule</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateRule)}>
                  <DialogHeader>
                    <DialogTitle>New Reminder Rule</DialogTitle>
                    <DialogDescription>
                      Configure when and what to send to your clients automatically.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-5 py-4">

                    {/* ── Step 1: Timing sentence ───────────────────── */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">When to send</p>
                      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-3">
                        <span className="text-sm">Send a</span>

                        <FormField
                          control={form.control}
                          name="channel"
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="h-7 w-auto gap-1 border-primary/40 bg-background px-2 text-sm font-medium">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="offsetHours"
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="h-7 w-auto gap-1 border-primary/40 bg-background px-2 text-sm font-medium">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 hour</SelectItem>
                                    <SelectItem value="2">2 hours</SelectItem>
                                    <SelectItem value="4">4 hours</SelectItem>
                                    <SelectItem value="24">1 day</SelectItem>
                                    <SelectItem value="48">2 days</SelectItem>
                                    <SelectItem value="168">1 week</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="triggerType"
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="h-7 w-auto gap-1 border-primary/40 bg-background px-2 text-sm font-medium">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="before">before</SelectItem>
                                    <SelectItem value="after">after</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <span className="text-sm">the appointment.</span>
                      </div>

                      {/* Live summary sentence */}
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {(() => {
                          const channel = form.watch('channel')
                          const offset = form.watch('offsetHours')
                          const trigger = form.watch('triggerType')
                          const offsetLabel: Record<string, string> = {
                            '1': '1 hour', '2': '2 hours', '4': '4 hours',
                            '24': '1 day', '48': '2 days', '168': '1 week',
                          }
                          return `Your client will receive a ${channel === 'email' ? 'email' : 'text message'} ${offsetLabel[offset] ?? offset} ${trigger} their appointment.`
                        })()}
                      </p>
                    </div>

                    {/* ── Step 2: Rule name ─────────────────────────── */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name <span className="text-muted-foreground font-normal">(for your reference)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 24-Hour Reminder" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── Divider ───────────────────────────────────── */}
                    <div className="border-t pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
                    </div>

                    {/* Email subject — only shown for email channel */}
                    {form.watch('channel') === 'email' && (
                      <FormField
                        control={form.control}
                        name="templateSubject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject Line</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Reminder: Your appointment is tomorrow" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Body with inline AI + variable insert */}
                    <FormField
                      control={form.control}
                      name="templateBody"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>
                              {form.watch('channel') === 'email' ? 'Email Body' : 'Message'}
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 gap-1 px-2 text-xs text-primary hover:text-primary"
                              disabled={aiLoading}
                              onClick={async () => {
                                setAiLoading(true)
                                try {
                                  const triggerType = form.getValues('triggerType')
                                  const offsetHours = Number(form.getValues('offsetHours'))
                                  const offsetMinutes = offsetHours * 60 * (triggerType === 'before' ? -1 : 1)
                                  const eventType = triggerType === 'after' ? 'follow_up'
                                    : (offsetHours === 0 ? 'confirmation_request' : 'reminder')
                                  const result = await generateCopy.mutateAsync({
                                    ruleName: form.getValues('name') || 'New Reminder',
                                    eventType,
                                    offsetMinutes,
                                    businessName: 'RemindFlow',
                                    businessType: 'appointment-based service business',
                                    senderName: 'Client Care Team',
                                    tone: 'warm',
                                    includeLocation: true,
                                    includeRescheduleOption: triggerType === 'before',
                                  })
                                  if (form.watch('channel') === 'email') {
                                    form.setValue('templateSubject', result.draft.subject)
                                  }
                                  form.setValue('templateBody', result.draft.bodyText)
                                  toast.success('AI copy generated — review and edit as needed')
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : 'AI generation failed')
                                } finally {
                                  setAiLoading(false)
                                }
                              }}
                            >
                              <Sparkles className="size-3" />
                              {aiLoading ? 'Writing...' : 'Write with AI'}
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder={
                                form.watch('channel') === 'email'
                                  ? 'Hi [Client Name], just a friendly reminder about your upcoming appointment...'
                                  : 'Hi [Client Name], reminder: your appointment is tomorrow at [Time]. Reply STOP to opt out.'
                              }
                              {...field}
                            />
                          </FormControl>

                          {/* Variable insert row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">Insert:</span>
                            {[
                              { label: 'Client name', value: '{{client_name}}' },
                              { label: 'Date & time', value: '{{appointment_start_local}}' },
                              { label: 'Service', value: '{{appointment_title}}' },
                              { label: 'Location', value: '{{location_name}}' },
                              ...(form.watch('channel') === 'email'
                                ? [
                                    { label: 'Confirm link', value: '{{confirm_url}}' },
                                    { label: 'Reschedule link', value: '{{reschedule_url}}' },
                                  ]
                                : []),
                            ].map((v) => (
                              <button
                                key={v.value}
                                type="button"
                                className="rounded border border-dashed px-1.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                onClick={() => {
                                  const current = field.value || ''
                                  const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="templateBody"]')
                                  if (textarea) {
                                    const start = textarea.selectionStart
                                    const end = textarea.selectionEnd
                                    const newVal = current.slice(0, start) + v.value + current.slice(end)
                                    field.onChange(newVal)
                                    setTimeout(() => {
                                      textarea.selectionStart = textarea.selectionEnd = start + v.value.length
                                      textarea.focus()
                                    }, 0)
                                  } else {
                                    field.onChange(current + v.value)
                                  }
                                }}
                              >
                                + {v.label}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createRule.isPending}>
                      {createRule.isPending ? 'Creating...' : 'Create Rule'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-elevated">
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
          <Card className="card-elevated">
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
          <Card className="card-elevated">
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
        <Card className="card-elevated">
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
              {activeRules.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Bell className="size-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">No active reminder rules</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Create your first rule to automatically send reminders before appointments.
                    </p>
                  </div>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Plus className="size-4" />
                    Create first rule
                  </button>
                </div>
              ) : (
              activeRules.map((rule) => (
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
                      onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
                      disabled={toggleRule.isPending}
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleRule(rule.id, rule.isActive)}>
                          <Power className="mr-2 size-4" />
                          {rule.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRule(rule.id)} disabled={deleteRule.isPending}>
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>

        {/* Inactive Rules */}
        {inactiveRules.length > 0 && (
          <Card className="card-elevated">
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
                        onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
                        disabled={toggleRule.isPending}
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRule(rule.id)} disabled={deleteRule.isPending}>
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
