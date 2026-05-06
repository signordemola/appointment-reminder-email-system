'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MailCheck,
  Mail,
  MoreHorizontal,
  Phone,
  User,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PreparedDashboardData } from '@/lib/types/dashboard.types'

// ── Status badge styles ──────────────────────────────────────
const statusStyles: Record<string, string> = {
  confirmed: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20',
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  cancelled: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20',
  no_show: 'bg-status-noshow/10 text-status-noshow border-status-noshow/20',
  scheduled: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  reschedule_requested: 'bg-status-rescheduled/10 text-status-rescheduled border-status-rescheduled/20',
}

// ── Event icons/colors for the activity feed ─────────────────
const eventIconMap: Record<string, typeof Mail> = {
  sent: Mail,
  delivered: MailCheck,
  opened: MailCheck,
  clicked: CheckCircle2,
  failed: XCircle,
  bounced: XCircle,
}
const eventColorMap: Record<string, string> = {
  sent: 'text-primary',
  delivered: 'text-status-confirmed',
  opened: 'text-status-confirmed',
  clicked: 'text-status-confirmed',
  failed: 'text-destructive',
  bounced: 'text-destructive',
}

interface Props {
  data: PreparedDashboardData
}

export function DashboardContent({ data }: Props) {
  const { stats, weeklyBreakdown, deliveryMetrics, upcomingToday, recentEvents } = data

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── KPI Stats Grid ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn('flex size-10 items-center justify-center rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('size-5', stat.color)} />
                </div>
                {stat.trend === 'up' && <TrendingUp className="size-4 text-status-confirmed" />}
                {stat.trend === 'down' && <TrendingDown className="size-4 text-destructive" />}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Middle Row: Chart + Delivery ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Weekly Overview Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Appointment status breakdown for this week</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments">
                View all <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBreakdown} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="confirmed"
                    fill="hsl(var(--status-confirmed))"
                    radius={[4, 4, 0, 0]}
                    name="Confirmed"
                  />
                  <Bar
                    dataKey="pending"
                    fill="hsl(var(--status-pending))"
                    radius={[4, 4, 0, 0]}
                    name="Pending"
                  />
                  <Bar
                    dataKey="cancelled"
                    fill="hsl(var(--status-cancelled))"
                    radius={[4, 4, 0, 0]}
                    name="Cancelled"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm bg-status-confirmed" />
                <span className="text-sm text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm bg-status-pending" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm bg-status-cancelled" />
                <span className="text-sm text-muted-foreground">Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Email and reminder statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressStat
              icon={<MailCheck className="size-4 text-status-confirmed" />}
              label="Email Delivery Rate"
              value={deliveryMetrics.deliveryRate}
              detail={`${deliveryMetrics.remindersSent} of ${deliveryMetrics.totalReminders} emails delivered this week`}
              barColor="bg-status-confirmed"
            />
            <ProgressStat
              icon={<CheckCircle2 className="size-4 text-primary" />}
              label="Confirmation Rate"
              value={deliveryMetrics.confirmationRate}
              detail={`${deliveryMetrics.confirmedAppts} of ${deliveryMetrics.totalAppts} clients confirmed`}
              barColor="bg-primary"
            />
            <ProgressStat
              icon={<XCircle className="size-4 text-destructive" />}
              label="No-show Rate"
              value={deliveryMetrics.noShowRate}
              detail={`${deliveryMetrics.noShows} no-shows this week`}
              barColor="bg-destructive"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Upcoming + Activity ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Upcoming Today */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Today</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments">
                View all <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingToday.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming appointments today
                </p>
              ) : (
                upcomingToday.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {appointment.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{appointment.time}</p>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', statusStyles[appointment.status])}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Phone className="mr-2 size-4" />
                            Call client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 size-4" />
                            Send reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/appointments/${appointment.id}`}>
                            <User className="mr-2 size-4" />
                            View details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No recent activity
                </p>
              ) : (
                recentEvents.map((activity) => {
                  const Icon = eventIconMap[activity.type] || Mail
                  const iconColor = eventColorMap[activity.type] || 'text-muted-foreground'
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={cn('mt-0.5', iconColor)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Progress bar sub-component ────────────────────────────────
function ProgressStat({
  icon,
  label,
  value,
  detail,
  barColor,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  barColor: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full transition-all', barColor)} style={{ width: `${Math.round(value)}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
