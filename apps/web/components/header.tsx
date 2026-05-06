'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { DateTime } from 'luxon'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { CommandSearch } from '@/components/command-search'
import { useDashboardSummary } from '@/lib/hooks/use-dashboard'

interface HeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function Header({ title, breadcrumbs = [] }: HeaderProps) {
  const { data } = useDashboardSummary()
  const notificationCount = (data?.metrics?.rescheduleRequests ?? 0) + (data?.metrics?.deliveryFailures ?? 0)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  const today = DateTime.now().toFormat('EEE, MMM d')

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-white/95 px-5 backdrop-blur-sm supports-backdrop-filter:bg-white/80 text-foreground">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </BreadcrumbItem>
                )}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        {/* Current Date */}
        <span className="hidden lg:inline text-sm text-muted-foreground">{today}</span>

        <CommandSearch />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {mounted && notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground badge-pulse">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
