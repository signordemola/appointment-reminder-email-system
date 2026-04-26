import { cn } from "@/lib/utils"

import type { AppointmentStatus } from "@/lib/api"

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: "bg-accent text-accent-foreground",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  reschedule_requested:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  canceled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  completed: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200",
  no_show: "bg-destructive/15 text-destructive",
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em]",
        statusStyles[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  )
}

export { StatusBadge }
