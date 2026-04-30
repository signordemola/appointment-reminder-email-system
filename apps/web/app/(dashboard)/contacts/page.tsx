'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Upload,
  User,
  Calendar,
} from 'lucide-react'
import { DateTime } from 'luxon'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  avatar: string | null
  initials: string
  totalAppointments: number
  lastVisit: string | null
  status: 'active' | 'inactive'
  createdAt: string
}

const contacts: Contact[] = [
  { id: '1', name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 (555) 123-4567', avatar: null, initials: 'EW', totalAppointments: 12, lastVisit: DateTime.now().minus({ days: 5 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ months: 6 }).toISO()! },
  { id: '2', name: 'James Chen', email: 'james@example.com', phone: '+1 (555) 234-5678', avatar: null, initials: 'JC', totalAppointments: 8, lastVisit: DateTime.now().minus({ days: 12 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ months: 4 }).toISO()! },
  { id: '3', name: 'Olivia Martinez', email: 'olivia@example.com', phone: '+1 (555) 345-6789', avatar: null, initials: 'OM', totalAppointments: 15, lastVisit: DateTime.now().minus({ days: 3 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ months: 8 }).toISO()! },
  { id: '4', name: 'Michael Brown', email: 'michael@example.com', phone: '+1 (555) 456-7890', avatar: null, initials: 'MB', totalAppointments: 5, lastVisit: DateTime.now().minus({ days: 20 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ months: 3 }).toISO()! },
  { id: '5', name: 'Sophie Taylor', email: 'sophie@example.com', phone: '+1 (555) 567-8901', avatar: null, initials: 'ST', totalAppointments: 22, lastVisit: DateTime.now().minus({ days: 1 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ years: 1 }).toISO()! },
  { id: '6', name: 'David Kim', email: 'david@example.com', phone: '+1 (555) 678-9012', avatar: null, initials: 'DK', totalAppointments: 3, lastVisit: DateTime.now().minus({ days: 45 }).toISO()!, status: 'inactive', createdAt: DateTime.now().minus({ months: 2 }).toISO()! },
  { id: '7', name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+1 (555) 789-0123', avatar: null, initials: 'LA', totalAppointments: 7, lastVisit: DateTime.now().minus({ days: 30 }).toISO()!, status: 'active', createdAt: DateTime.now().minus({ months: 5 }).toISO()! },
  { id: '8', name: 'Ryan Garcia', email: 'ryan@example.com', phone: '+1 (555) 890-1234', avatar: null, initials: 'RG', totalAppointments: 1, lastVisit: null, status: 'active', createdAt: DateTime.now().minus({ weeks: 1 }).toISO()! },
]

export default function ContactsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Contact>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={row.original.avatar ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {row.original.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'totalAppointments',
        header: 'Appointments',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.totalAppointments}</span>
        ),
      },
      {
        accessorKey: 'lastVisit',
        header: 'Last Visit',
        cell: ({ row }) => {
          if (!row.original.lastVisit) {
            return <span className="text-muted-foreground">Never</span>
          }
          const dt = DateTime.fromISO(row.original.lastVisit)
          return <span className="text-sm">{dt.toRelative()}</span>
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge 
            variant="outline" 
            className={row.original.status === 'active' 
              ? 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' 
              : 'bg-muted text-muted-foreground'
            }
          >
            {row.original.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 size-4" />
                Book appointment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 size-4" />
                Send email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 size-4" />
                Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: contacts,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase()
      return (
        row.original.name.toLowerCase().includes(searchValue) ||
        row.original.email.toLowerCase().includes(searchValue) ||
        row.original.phone.includes(searchValue)
      )
    },
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
  })

  return (
    <>
      <Header
        title="Contacts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Contacts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Upload className="mr-2 size-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 size-4" />
              Export
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">Add Contact</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Add a new client to your contact list.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Contact</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No contacts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} contact(s)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
