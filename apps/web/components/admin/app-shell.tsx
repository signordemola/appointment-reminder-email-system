import type { ReactNode } from "react"

import { SidebarNav } from "@/components/admin/sidebar-nav"
import { Topbar } from "@/components/admin/topbar"

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.08),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(248,250,252,1))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.12),_transparent_36%),linear-gradient(180deg,_rgba(15,23,42,0.94),_rgba(2,6,23,1))]">
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="px-4 py-6 xl:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export { AppShell }
