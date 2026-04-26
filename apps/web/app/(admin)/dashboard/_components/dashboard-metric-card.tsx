import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DashboardMetricCardProps = {
  label: string
  value: string
  helper?: string
  icon: ReactNode
  tone?: "default" | "success" | "warning" | "danger"
}

const toneClasses = {
  default: "bg-secondary/10 text-secondary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
}

function DashboardMetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: DashboardMetricCardProps) {
  return (
    <article className="surface-panel flex min-h-40 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-micro">{label}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            toneClasses[tone],
          )}
        >
          {icon}
        </div>
      </div>
      {helper ? <p className="text-sm text-muted-foreground">{helper}</p> : <span />}
    </article>
  )
}

export { DashboardMetricCard }
