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

export default function RemindersPage() {
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

  const { data: apiRules, isLoading, error } = useReminderRules()
  const createRule = useCreateReminderRule()
  const toggleRule = useToggleReminderRule()
  const deleteRule = useDeleteReminderRule()

  const rules = useMemo(() => apiRules?.map(mapApiReminderRule) ?? [], [apiRules])
  const activeRules = rules.filter(r => r.isActive)
  const inactiveRules = rules.filter(r => !r.isActive)

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
    const offsetMinutes = Number(values.offsetHours) * (values.triggerType === 'before' ? -1 : 1)
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

  if (error) {
    return (
      <>
        <Header title="Reminder Rules" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reminder Rules' }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load reminder rules.</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Reminder Rules"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reminder Rules' },
        ]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">New Rule</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateRule)}>
                  <DialogHeader>
                    <DialogTitle>Create Reminder Rule</DialogTitle>
                    <DialogDescription>
                      Set up an automated reminder that will be sent to clients.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 24-Hour Reminder" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="triggerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trigger</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="before">Before appointment</SelectItem>
                                  <SelectItem value="after">After appointment</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="offsetHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Offset</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="templateSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Reminder: Your appointment is coming up" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="templateBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Template</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Hi {{contact_name}}, this is a reminder..."
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Available variables: {'{{contact_name}}'}, {'{{service_type}}'}, {'{{appointment_date}}'}, {'{{appointment_time}}'}
                          </p>
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
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="size-10 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
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
            </>
          )}
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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="size-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))
              ) : activeRules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active rules.</p>
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
