'use client'

import { useState } from 'react'
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
  Plus,
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

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Mock data for the dashboard
const stats = [
  {
    title: "Today's Appointments",
    value: 12,
    change: '+2 from yesterday',
    trend: 'up',
    icon: Calendar,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Confirmed',
    value: 8,
    change: '67% confirmation rate',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-status-confirmed',
    bgColor: 'bg-status-confirmed/10',
  },
  {
    title: 'Pending Response',
    value: 3,
    change: 'Reminders sent',
    trend: 'neutral',
    icon: Clock,
    color: 'text-status-pending',
    bgColor: 'bg-status-pending/10',
  },
  {
    title: 'Reschedule Requests',
    value: 3,
    change: 'Needs attention',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
]

const weeklyData = [
  { day: 'Mon', confirmed: 8, pending: 2, cancelled: 1, noshow: 0 },
  { day: 'Tue', confirmed: 10, pending: 3, cancelled: 0, noshow: 1 },
  { day: 'Wed', confirmed: 7, pending: 4, cancelled: 2, noshow: 0 },
  { day: 'Thu', confirmed: 12, pending: 1, cancelled: 1, noshow: 1 },
  { day: 'Fri', confirmed: 9, pending: 2, cancelled: 0, noshow: 0 },
  { day: 'Sat', confirmed: 6, pending: 3, cancelled: 1, noshow: 0 },
  { day: 'Sun', confirmed: 0, pending: 0, cancelled: 0, noshow: 0 },
]

const upcomingAppointments = [
  {
    id: '1',
    client: 'Emma Wilson',
    service: 'Deep Tissue Massage',
    time: '9:00 AM',
    status: 'confirmed',
    avatar: null,
    initials: 'EW',
    phone: '+1 (555) 123-4567',
  },
  {
    id: '2',
    client: 'James Chen',
    service: 'Swedish Massage',
    time: '10:30 AM',
    status: 'pending',
    avatar: null,
    initials: 'JC',
    phone: '+1 (555) 234-5678',
  },
  {
    id: '3',
    client: 'Olivia Martinez',
    service: 'Hot Stone Therapy',
    time: '12:00 PM',
    status: 'confirmed',
    avatar: null,
    initials: 'OM',
    phone: '+1 (555) 345-6789',
  },
  {
    id: '4',
    client: 'Michael Brown',
    service: 'Sports Massage',
    time: '2:00 PM',
    status: 'pending',
    avatar: null,
    initials: 'MB',
    phone: '+1 (555) 456-7890',
  },
  {
    id: '5',
    client: 'Sophie Taylor',
    service: 'Aromatherapy',
    time: '3:30 PM',
    status: 'confirmed',
    avatar: null,
    initials: 'ST',
    phone: '+1 (555) 567-8901',
  },
]

const recentActivity = [
  {
    id: '1',
    type: 'confirmation',
    message: 'Emma Wilson confirmed her appointment',
    time: '5 minutes ago',
    icon: CheckCircle2,
    iconColor: 'text-status-confirmed',
  },
  {
    id: '2',
    type: 'reminder_sent',
    message: 'Reminder sent to James Chen',
    time: '15 minutes ago',
    icon: Mail,
    iconColor: 'text-primary',
  },
  {
    id: '3',
    type: 'reschedule',
    message: 'David Kim requested to reschedule',
    time: '1 hour ago',
    icon: AlertTriangle,
    iconColor: 'text-status-pending',
  },
  {
    id: '4',
    type: 'cancellation',
    message: 'Lisa Anderson cancelled her appointment',
    time: '2 hours ago',
    icon: XCircle,
    iconColor: 'text-destructive',
  },
]

const statusStyles: Record<string, string> = {
  confirmed: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20',
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  cancelled: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20',
}

export default function DashboardPage() {
  return (
    <>
      <Header 
        title="Dashboard" 
        actions={
          <Button size="sm" className="gap-1">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Appointment</span>
          </Button>
        }
      />
      
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Stats Grid */}
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

        {/* Main Content Grid */}
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
                  <BarChart data={weeklyData} barGap={4}>
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

          {/* Email Delivery Stats */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>Email and reminder statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MailCheck className="size-4 text-status-confirmed" />
                    <span>Email Delivery Rate</span>
                  </div>
                  <span className="font-medium">98.5%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-status-confirmed" style={{ width: '98.5%' }} />
                </div>
                <p className="text-xs text-muted-foreground">247 of 251 emails delivered this week</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span>Confirmation Rate</span>
                  </div>
                  <span className="font-medium">72%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: '72%' }} />
                </div>
                <p className="text-xs text-muted-foreground">36 of 50 clients confirmed</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <XCircle className="size-4 text-destructive" />
                    <span>No-show Rate</span>
                  </div>
                  <span className="font-medium">4%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-destructive" style={{ width: '4%' }} />
                </div>
                <p className="text-xs text-muted-foreground">2 no-shows this week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Upcoming Appointments */}
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
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={appointment.avatar ?? undefined} />
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
                          <DropdownMenuItem>
                            <User className="mr-2 size-4" />
                            View profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
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
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={cn('mt-0.5', activity.iconColor)}>
                      <activity.icon className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
