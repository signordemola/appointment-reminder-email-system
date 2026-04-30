import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-status-noshow/15 text-status-noshow border-status-noshow/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-muted text-muted-foreground border-border',
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'bg-status-rescheduled/15 text-status-rescheduled border-status-rescheduled/30',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
