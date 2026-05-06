'use client'

import Link from 'next/link'
import {
  Calendar,
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
import type { LucideIcon } from 'lucide-react'
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

// ── KPI icon map (string → component) ────────────────────────
const kpiIconMap: Record<string, LucideIcon> = {
  'calendar': Calendar,
  'check-circle': CheckCircle2,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
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
        {stats.map((stat) => {
          const Icon = kpiIconMap[stat.icon] || Calendar
          return (
          <Card key={stat.title} className="card-elevated cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('flex size-10 items-center justify-center rounded-xl', stat.bgColor)}>
                  <Icon className={cn('size-5', stat.color)} />
                </div>
                {stat.trend === 'up' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-status-confirmed">
                    <TrendingUp className="size-3" /> Up
                  </span>
                )}
                {stat.trend === 'down' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <TrendingDown className="size-3" /> Needs attention
                  </span>
                )}
              </div>
              <p className="text-3xl font-extrabold tracking-tight tabular-nums">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-foreground/80">{stat.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {/* ── Middle Row: Chart + Delivery ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Weekly Overview Chart */}
        <Card className="lg:col-span-4 card-elevated">
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
                <BarChart data={weeklyBreakdown} barGap={2} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  />
                  <Bar dataKey="confirmed" fill="#16a34a" radius={[3, 3, 0, 0]} name="Confirmed" />
                  <Bar dataKey="pending" fill="#d97706" radius={[3, 3, 0, 0]} name="Pending" />
                  <Bar dataKey="cancelled" fill="#dc2626" radius={[3, 3, 0, 0]} name="Cancelled" />
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
        <Card className="lg:col-span-3 card-elevated">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Email and reminder statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressStat
              icon={<MailCheck className="size-4" style={{ color: '#16a34a' }} />}
              label="Email Delivery Rate"
              value={deliveryMetrics.deliveryRate}
              detail={`${deliveryMetrics.remindersSent} of ${deliveryMetrics.totalReminders} emails delivered this week`}
              barHex="#16a34a"
            />
            <ProgressStat
              icon={<CheckCircle2 className="size-4" style={{ color: '#0d9488' }} />}
              label="Confirmation Rate"
              value={deliveryMetrics.confirmationRate}
              detail={`${deliveryMetrics.confirmedAppts} of ${deliveryMetrics.totalAppts} clients confirmed`}
              barHex="#0d9488"
            />
            <ProgressStat
              icon={<XCircle className="size-4" style={{ color: '#dc2626' }} />}
              label="No-show Rate"
              value={deliveryMetrics.noShowRate}
              detail={`${deliveryMetrics.noShows} no-shows this week`}
              barHex="#dc2626"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Upcoming + Activity ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Upcoming Today */}
        <Card className="lg:col-span-3 card-elevated">
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
                    className="flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
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
        <Card className="lg:col-span-2 card-elevated">
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
                    <div key={activity.id} className="flex gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-muted/50">
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
  barHex,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  barHex: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(Math.round(value), 100)}%`, backgroundColor: barHex }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
