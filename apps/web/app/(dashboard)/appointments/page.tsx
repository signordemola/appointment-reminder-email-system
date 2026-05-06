'use client'

import { useState, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { useAppointments, useCreateAppointment, useImportAppointments, type Appointment as ApiAppointment } from '@/lib/hooks/use-appointments'
import { useContacts } from '@/lib/hooks/use-contacts'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const appointmentFormSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  service: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
})

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

// Types - extending from API
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

// Map API appointment to table format
function mapApiAppointment(apiAppt: ApiAppointment): Appointment {
  const duration = apiAppt.endsAtUtc
    ? Math.round((new Date(apiAppt.endsAtUtc).getTime() - new Date(apiAppt.startsAtUtc).getTime()) / 60000)
    : 60
  
  const sentReminders = apiAppt.reminderEvents?.filter(e => 
    e.status === 'sent' || e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked'
  ).length ?? 0

  const statusMap: Record<string, Appointment['status']> = {
    scheduled: 'scheduled',
    confirmed: 'confirmed',
    canceled: 'cancelled',
    no_show: 'no-show',
    completed: 'completed',
    reschedule_requested: 'rescheduled',
  }

  return {
    id: apiAppt.id,
    client: {
      name: apiAppt.contact.fullName,
      email: apiAppt.contact.email,
      phone: apiAppt.contact.phone || '',
      avatar: null,
      initials: apiAppt.contact.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    },
    service: apiAppt.title,
    datetime: apiAppt.startsAtUtc,
    duration,
    status: statusMap[apiAppt.status] ?? 'scheduled',
    remindersSent: sentReminders,
  }
}

const statusConfig: Record<Appointment['status'], { label: string; style: React.CSSProperties }> = {
  scheduled: { label: 'Scheduled', style: { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' } },
  confirmed: { label: 'Confirmed', style: { backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' } },
  cancelled: { label: 'Cancelled', style: { backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' } },
  'no-show': { label: 'No Show', style: { backgroundColor: 'rgba(234,88,12,0.1)', color: '#ea580c' } },
  completed: { label: 'Completed', style: { backgroundColor: 'rgba(107,114,128,0.1)', color: '#374151' } },
  rescheduled: { label: 'Rescheduled', style: { backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706' } },
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
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      clientId: '',
      service: '',
      date: '',
      time: '',
    },
  })

  const { data, isLoading, error } = useAppointments({ 
    page: 1, 
    pageSize: 100,
    status: statusFilter === 'all' ? undefined : statusFilter 
  })
  const { data: contactsData } = useContacts()
  const createAppointment = useCreateAppointment()
  const importAppointments = useImportAppointments()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await importAppointments.mutateAsync(file)
      toast.success(`Imported ${result.imported} appointment${result.imported !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} failed.` : ''}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const appointments = useMemo(() => {
    return data?.items.map(mapApiAppointment) ?? []
  }, [data])

  const filteredData = useMemo(() => {
    if (!globalFilter) return appointments
    const search = globalFilter.toLowerCase()
    return appointments.filter((a) =>
      a.client.name.toLowerCase().includes(search) ||
      a.client.email.toLowerCase().includes(search) ||
      a.service.toLowerCase().includes(search)
    )
  }, [appointments, globalFilter])

  const handleCreateAppointment = async (values: AppointmentFormValues) => {
    const contact = contactsData?.find(c => c.id === values.clientId)
    if (!contact) {
      toast.error('Selected client not found')
      return
    }

    const startsAt = DateTime.fromISO(`${values.date}T${values.time}`)
    const duration = values.service.includes('90') ? 90 : values.service.includes('75') ? 75 : 60
    const endsAt = startsAt.plus({ minutes: duration })

    try {
      await createAppointment.mutateAsync({
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        contactTimezone: contact.timezone,
        emailOptOut: contact.emailOptOut,
        title: values.service.split('(')[0].trim(),
        startsAtUtc: startsAt.toUTC().toISO() || '',
        endsAtUtc: endsAt.toUTC().toISO() || '',
        displayTimezone: contact.timezone,
      })
      toast.success('Appointment created successfully')
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create appointment')
    }
  }

  if (error) {
    return (
      <>
        <Header title="Appointments" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Appointments' }]} />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load appointments.</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

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
              <Avatar className="size-9 ring-2 ring-transparent transition-all group-hover:ring-primary/30">
                <AvatarImage src={client.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{client.name}</p>
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
            <Badge variant="outline" className="text-xs border-transparent font-medium" style={config.style}>
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
              <DropdownMenuItem onClick={() => window.location.href = `/appointments/${row.original.id}`}>
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
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* ── Page Heading ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Appointments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">View and manage all your scheduled appointments.</p>
          </div>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => fileInputRef.current?.click()}
              disabled={importAppointments.isPending}
            >
              <Upload className="mr-2 size-4" />
              {importAppointments.isPending ? 'Importing...' : 'Import'}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">New Appointment</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateAppointment)}>
                    <DialogHeader>
                      <DialogTitle>Create New Appointment</DialogTitle>
                      <DialogDescription>
                        Schedule a new appointment for a client.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                  {contactsData?.map(contact => (
                                    <SelectItem key={contact.id} value={contact.id}>{contact.fullName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Deep Tissue Massage (60 min)">Deep Tissue Massage (60 min)</SelectItem>
                                  <SelectItem value="Swedish Massage (90 min)">Swedish Massage (90 min)</SelectItem>
                                  <SelectItem value="Hot Stone Therapy (75 min)">Hot Stone Therapy (75 min)</SelectItem>
                                  <SelectItem value="Sports Massage (60 min)">Sports Massage (60 min)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createAppointment.isPending}>
                        {createAppointment.isPending ? 'Creating...' : 'Create Appointment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="card-elevated">
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
                    <SelectItem value="canceled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="reschedule_requested">Rescheduled</SelectItem>
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Skeleton className="size-3" />
                            <Skeleton className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="group cursor-pointer transition-colors hover:bg-muted/40"
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
                      <TableCell colSpan={columns.length} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Calendar className="size-10 opacity-20" />
                          <p className="text-sm font-medium">No appointments found</p>
                          <p className="text-xs">Create a new appointment or adjust your filters</p>
                        </div>
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
