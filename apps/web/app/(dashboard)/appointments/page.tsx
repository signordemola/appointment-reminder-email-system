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
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Upload,
  User,
  X,
} from 'lucide-react'
import { DateTime } from 'luxon'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { cn } from '@/lib/utils'

// Types
interface Appointment {
  id: string
  client: {
    name: string
    email: string
    phone: string
    avatar: string | null
    initials: string
  }
  service: string
  datetime: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'no-show' | 'completed' | 'rescheduled'
  remindersSent: number
  notes?: string
}

// Mock data
const appointments: Appointment[] = [
  {
    id: '1',
    client: { name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 (555) 123-4567', avatar: null, initials: 'EW' },
    service: 'Deep Tissue Massage',
    datetime: DateTime.now().plus({ hours: 2 }).toISO()!,
    duration: 60,
    status: 'confirmed',
    remindersSent: 2,
  },
  {
    id: '2',
    client: { name: 'James Chen', email: 'james@example.com', phone: '+1 (555) 234-5678', avatar: null, initials: 'JC' },
    service: 'Swedish Massage',
    datetime: DateTime.now().plus({ hours: 4 }).toISO()!,
    duration: 90,
    status: 'scheduled',
    remindersSent: 1,
  },
  {
    id: '3',
    client: { name: 'Olivia Martinez', email: 'olivia@example.com', phone: '+1 (555) 345-6789', avatar: null, initials: 'OM' },
    service: 'Hot Stone Therapy',
    datetime: DateTime.now().plus({ days: 1 }).toISO()!,
    duration: 75,
    status: 'confirmed',
    remindersSent: 1,
  },
  {
    id: '4',
    client: { name: 'Michael Brown', email: 'michael@example.com', phone: '+1 (555) 456-7890', avatar: null, initials: 'MB' },
    service: 'Sports Massage',
    datetime: DateTime.now().plus({ days: 1, hours: 3 }).toISO()!,
    duration: 60,
    status: 'scheduled',
    remindersSent: 0,
  },
  {
    id: '5',
    client: { name: 'Sophie Taylor', email: 'sophie@example.com', phone: '+1 (555) 567-8901', avatar: null, initials: 'ST' },
    service: 'Aromatherapy',
    datetime: DateTime.now().plus({ days: 2 }).toISO()!,
    duration: 60,
    status: 'confirmed',
    remindersSent: 2,
  },
  {
    id: '6',
    client: { name: 'David Kim', email: 'david@example.com', phone: '+1 (555) 678-9012', avatar: null, initials: 'DK' },
    service: 'Prenatal Massage',
    datetime: DateTime.now().minus({ days: 1 }).toISO()!,
    duration: 60,
    status: 'completed',
    remindersSent: 3,
  },
  {
    id: '7',
    client: { name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+1 (555) 789-0123', avatar: null, initials: 'LA' },
    service: 'Reflexology',
    datetime: DateTime.now().minus({ days: 1 }).toISO()!,
    duration: 45,
    status: 'no-show',
    remindersSent: 3,
  },
  {
    id: '8',
    client: { name: 'Ryan Garcia', email: 'ryan@example.com', phone: '+1 (555) 890-1234', avatar: null, initials: 'RG' },
    service: 'Deep Tissue Massage',
    datetime: DateTime.now().plus({ days: 3 }).toISO()!,
    duration: 90,
    status: 'rescheduled',
    remindersSent: 1,
  },
  {
    id: '9',
    client: { name: 'Jennifer Lee', email: 'jennifer@example.com', phone: '+1 (555) 901-2345', avatar: null, initials: 'JL' },
    service: 'Swedish Massage',
    datetime: DateTime.now().minus({ days: 2 }).toISO()!,
    duration: 60,
    status: 'cancelled',
    remindersSent: 2,
  },
  {
    id: '10',
    client: { name: 'Chris Thompson', email: 'chris@example.com', phone: '+1 (555) 012-3456', avatar: null, initials: 'CT' },
    service: 'Hot Stone Therapy',
    datetime: DateTime.now().plus({ days: 4 }).toISO()!,
    duration: 75,
    status: 'scheduled',
    remindersSent: 0,
  },
]

const statusConfig: Record<Appointment['status'], { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmed', className: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' },
  cancelled: { label: 'Cancelled', className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' },
  'no-show': { label: 'No Show', className: 'bg-status-noshow/10 text-status-noshow border-status-noshow/20' },
  completed: { label: 'Completed', className: 'bg-muted text-foreground' },
  rescheduled: { label: 'Rescheduled', className: 'bg-status-rescheduled/10 text-status-rescheduled border-status-rescheduled/20' },
}

function formatRelativeDate(isoString: string) {
  const dt = DateTime.fromISO(isoString)
  const now = DateTime.now()
  const diff = dt.startOf('day').diff(now.startOf('day'), 'days').days

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff <= 7) return dt.toFormat('EEEE')
  return dt.toFormat('MMM d')
}

export default function AppointmentsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [rowSelection, setRowSelection] = useState({})

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return appointments
    return appointments.filter((a) => a.status === statusFilter)
  }, [statusFilter])

  const columns: ColumnDef<Appointment>[] = useMemo(
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
        enableHiding: false,
      },
      {
        accessorKey: 'client',
        header: 'Client',
        cell: ({ row }) => {
          const client = row.original.client
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={client.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.email}</p>
              </div>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          const client = row.original.client
          return (
            client.name.toLowerCase().includes(value.toLowerCase()) ||
            client.email.toLowerCase().includes(value.toLowerCase())
          )
        },
      },
      {
        accessorKey: 'service',
        header: 'Service',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.service}</p>
            <p className="text-xs text-muted-foreground">{row.original.duration} min</p>
          </div>
        ),
      },
      {
        accessorKey: 'datetime',
        header: 'Date & Time',
        cell: ({ row }) => {
          const dt = DateTime.fromISO(row.original.datetime)
          return (
            <div>
              <p className="font-medium">{formatRelativeDate(row.original.datetime)}</p>
              <p className="text-xs text-muted-foreground">{dt.toFormat('h:mm a')}</p>
            </div>
          )
        },
        sortingFn: (rowA, rowB) => {
          return DateTime.fromISO(rowA.original.datetime).toMillis() - DateTime.fromISO(rowB.original.datetime).toMillis()
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const config = statusConfig[status]
          return (
            <Badge variant="outline" className={cn('text-xs', config.className)}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'remindersSent',
        header: 'Reminders',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Mail className="size-3 text-muted-foreground" />
            <span className="text-sm">{row.original.remindersSent}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 size-4" />
                Send reminder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 size-4" />
                Call client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="mr-2 size-4" />
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <X className="mr-2 size-4" />
                Cancel appointment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.original.client
      const service = row.original.service
      const searchValue = filterValue.toLowerCase()
      return (
        client.name.toLowerCase().includes(searchValue) ||
        client.email.toLowerCase().includes(searchValue) ||
        service.toLowerCase().includes(searchValue)
      )
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <>
      <Header
        title="Appointments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Appointments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Upload className="mr-2 size-4" />
              Import
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">New Appointment</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a new appointment for a client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emma">Emma Wilson</SelectItem>
                        <SelectItem value="james">James Chen</SelectItem>
                        <SelectItem value="olivia">Olivia Martinez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service">Service</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deep-tissue">Deep Tissue Massage (60 min)</SelectItem>
                        <SelectItem value="swedish">Swedish Massage (90 min)</SelectItem>
                        <SelectItem value="hot-stone">Hot Stone Therapy (75 min)</SelectItem>
                        <SelectItem value="sports">Sports Massage (60 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input type="date" id="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input type="time" id="time" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Appointment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search clients, services..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 size-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedCount} selected
                  </span>
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 size-4" />
                    Send Reminders
                  </Button>
                </div>
              )}
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
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} appointments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
