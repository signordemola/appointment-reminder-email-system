"use client"

import * as React from "react"
import Link from "next/link"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import { ConfirmationBadge } from "@/components/admin/confirmation-badge"
import { StatusBadge } from "@/components/admin/status-badge"
import type { AppointmentListItem, AppointmentsResponse } from "@/lib/api"
import { formatAppointmentDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type AppointmentsTableProps = {
  data: AppointmentsResponse
}

function AppointmentsTable({ data }: AppointmentsTableProps) {
  const [, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      search: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""),
      confirmationStatus: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      shallow: false,
      clearOnDefault: true,
    },
  )

  const columns = React.useMemo<ColumnDef<AppointmentListItem>[]>(
    () => [
      {
        accessorKey: "contact.fullName",
        header: "Client",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-foreground">{row.original.contact.fullName}</div>
            <div className="text-sm text-muted-foreground">{row.original.contact.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Appointment",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-foreground">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.locationName ?? "Location to be confirmed"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "startsAtUtc",
        header: "Date & Time",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-mono text-sm text-foreground">
              {formatAppointmentDate(
                row.original.startsAtUtc,
                row.original.displayTimezone,
              )}
            </div>
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {row.original.displayTimezone}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "confirmationStatus",
        header: "Confirmation",
        cell: ({ row }) => (
          <ConfirmationBadge confirmationStatus={row.original.confirmationStatus} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={`/appointments/${row.original.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const canGoPrevious = data.page > 1
  const canGoNext = data.page < data.totalPages

  return (
    <div className="surface-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-muted/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-5 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
                      header.id === "actions" ? "text-right" : "",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border/70 transition-colors hover:bg-accent/35"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "px-5 py-4 align-top text-sm",
                      cell.column.id === "actions" ? "text-right" : "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(data.page - 1) * data.pageSize + 1} to{" "}
          {Math.min(data.page * data.pageSize, data.total)} of {data.total} appointments
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => setFilters({ page: data.page - 1 })}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-45"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          <span className="rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setFilters({ page: data.page + 1 })}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-45"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { AppointmentsTable }
