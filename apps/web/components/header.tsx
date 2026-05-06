'use client'

import * as React from 'react'
import { Bell, Plus } from 'lucide-react'

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
  actions?: React.ReactNode
}

export function Header({ title, breadcrumbs = [], actions }: HeaderProps) {
  const { data } = useDashboardSummary()
  const notificationCount = (data?.metrics?.rescheduleRequests ?? 0) + (data?.metrics?.deliveryFailures ?? 0)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 p-5 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
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

      <div className="ml-auto flex items-center gap-2">
        <CommandSearch />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground badge-pulse">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {actions}
      </div>
    </header>
  )
}
