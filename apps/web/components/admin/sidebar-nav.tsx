"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarClock,
  CalendarRange,
  Gauge,
  LifeBuoy,
  LogOut,
  Settings2,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/appointments", label: "Appointments", icon: CalendarRange },
  {
    href: "/reschedule-requests",
    label: "Reschedule Requests",
    icon: CalendarClock,
  },
  { href: "/settings", label: "Settings", icon: Settings2 },
]

const footerItems = [
  { href: "#support", label: "Support", icon: LifeBuoy },
  { href: "#sign-out", label: "Sign Out", icon: LogOut },
]

function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 shrink-0 border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border/70 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-slate-900/10">
            <span className="text-lg font-black tracking-[0.16em]">AR</span>
          </div>
          <div className="space-y-1">
            <p className="text-micro">Portfolio Demo</p>
            <h2 className="text-lg font-bold text-foreground">Appointment Ops</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-5">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)]"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active ? (
                  <span className="ml-auto h-2 w-2 rounded-full bg-secondary" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1.5 border-t border-sidebar-border/70 pt-5">
          {footerItems.map((item) => {
            const Icon = item.icon

            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export { SidebarNav }
