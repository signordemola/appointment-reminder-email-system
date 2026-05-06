'use client'

import { useState, useMemo } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useContacts, useCreateContact, type Contact as ApiContact } from '@/lib/hooks/use-contacts'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const contactFormSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

interface ContactTableRow {
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

function mapApiContact(apiContact: ApiContact): ContactTableRow {
  return {
    id: apiContact.id,
    name: apiContact.fullName,
    email: apiContact.email,
    phone: apiContact.phone || '',
    avatar: null,
    initials: apiContact.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    totalAppointments: (apiContact as unknown as Record<string, unknown>).totalAppointments as number ?? 0,
    lastVisit: (apiContact as unknown as Record<string, unknown>).lastAppointmentAt as string ?? null,
    status: apiContact.emailOptOut ? 'inactive' : 'active',
    createdAt: apiContact.createdAt,
  }
}

interface ContactsContentProps {
  initialContacts: ApiContact[]
}

export function ContactsContent({ initialContacts }: ContactsContentProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: apiContacts } = useContacts(initialContacts)
  const createContact = useCreateContact()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })

  const contacts = useMemo(() => {
    return apiContacts?.map(mapApiContact) ?? []
  }, [apiContacts])

  const handleCreateContact = async (values: ContactFormValues) => {
    try {
      await createContact.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        timezone: 'America/New_York',
        emailOptOut: false,
      })
      toast.success('Contact created successfully')
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create contact')
    }
  }



  const columns: ColumnDef<ContactTableRow>[] = useMemo(
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">Add Contact</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateContact)}>
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                      <DialogDescription>
                        Add a new client to your contact list.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createContact.isPending}>
                        {createContact.isPending ? 'Creating...' : 'Add Contact'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
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
