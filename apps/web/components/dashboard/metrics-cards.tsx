'use client'

import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardMetrics } from '@/lib/types'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-status-confirmed/10',
    warning: 'bg-status-pending/10',
    danger: 'bg-status-cancelled/10',
  }

  return (
    <Card className={`${variantStyles[variant]} border-0 shadow-sm`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{value}</span>
              {trend && (
                <span className={`flex items-center text-xs font-medium ${
                  trend.isPositive ? 'text-status-confirmed' : 'text-status-cancelled'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="mr-0.5 size-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 size-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title="Today&apos;s Appointments"
        value={metrics.appointmentsToday}
        subtitle="Scheduled for today"
        icon={<Calendar className="size-5 text-muted-foreground" />}
      />
      <MetricCard
        title="Confirmed"
        value={metrics.confirmed}
        subtitle={`${Math.round((metrics.confirmed / metrics.appointmentsToday) * 100)}% of today`}
        icon={<CheckCircle2 className="size-5 text-status-confirmed" />}
        variant="success"
      />
      <MetricCard
        title="Pending"
        value={metrics.pending}
        subtitle="Awaiting confirmation"
        icon={<Clock className="size-5 text-status-pending" />}
        variant="warning"
      />
      <MetricCard
        title="Reschedule Requests"
        value={metrics.rescheduleRequests}
        subtitle="Needs attention"
        icon={<RefreshCw className="size-5 text-status-rescheduled" />}
      />
      <MetricCard
        title="No-Shows (This Week)"
        value={metrics.noShows}
        subtitle="Missed appointments"
        icon={<XCircle className="size-5 text-status-cancelled" />}
        variant="danger"
      />
    </div>
  )
}

interface DeliveryMetricsProps {
  deliveryRate: number
  confirmationRate: number
}

export function DeliveryMetrics({ deliveryRate, confirmationRate }: DeliveryMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Delivery Rate</p>
              <p className="mt-1 text-2xl font-semibold">{deliveryRate}%</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-status-confirmed transition-all"
                  style={{ width: `${deliveryRate}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmation Rate</p>
              <p className="mt-1 text-2xl font-semibold">{confirmationRate}%</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${confirmationRate}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
