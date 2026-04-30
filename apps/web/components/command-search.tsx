'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  CalendarClock,
  Bell,
  Users,
  RotateCcw,
  Settings,
  LayoutDashboard,
  Plus,
  Upload,
  Search,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', shortcut: '⌘D' },
  { icon: Calendar, label: 'Appointments', href: '/appointments', shortcut: '⌘A' },
  { icon: Users, label: 'Contacts', href: '/contacts', shortcut: '⌘C' },
  { icon: Bell, label: 'Reminder Rules', href: '/reminders', shortcut: '⌘R' },
  { icon: RotateCcw, label: 'Reschedule Requests', href: '/reschedule' },
  { icon: Settings, label: 'Settings', href: '/settings', shortcut: '⌘,' },
]

const actionItems = [
  { icon: Plus, label: 'Create appointment', action: 'create-appointment' },
  { icon: Upload, label: 'Import appointments', action: 'import-appointments' },
  { icon: Plus, label: 'Add contact', action: 'add-contact' },
  { icon: Plus, label: 'Create reminder rule', action: 'create-rule' },
]

export function CommandSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted sm:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 size-4" />
        <span className="hidden lg:inline-flex">Search appointments, contacts...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.action}
                onSelect={() => runCommand(() => {
                  // Handle actions - in real app, these would open dialogs
                  console.log('Action:', item.action)
                })}
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
