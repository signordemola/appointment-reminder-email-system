import type { ReactNode } from "react"
import { LifeBuoy } from "lucide-react"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(14,165,233,0.12),_transparent_22%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(241,245,249,0.94))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.65),transparent_42%)]" />

      <header className="relative border-b border-border/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="space-y-1">
            <p className="text-micro">Appointment Center</p>
            <div className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              ExpertRemind Operations
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <LifeBuoy className="h-4 w-4 text-secondary" />
            Need help? Reply to your original reminder email.
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-16">
        {children}
      </main>
    </div>
  )
}
