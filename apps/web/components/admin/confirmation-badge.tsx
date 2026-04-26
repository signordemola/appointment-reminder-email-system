import { cn } from "@/lib/utils"

import type { ConfirmationStatus } from "@/lib/api"

const confirmationStyles: Record<ConfirmationStatus, string> = {
  pending: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  confirmed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  expired: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  skipped: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
}

function ConfirmationBadge({
  confirmationStatus,
}: {
  confirmationStatus: ConfirmationStatus
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em]",
        confirmationStyles[confirmationStatus],
      )}
    >
      {confirmationStatus}
    </span>
  )
}

export { ConfirmationBadge }
