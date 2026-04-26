import Link from "next/link"
import { Plus, Upload } from "lucide-react"

import { AppointmentsFilterBar } from "@/app/(admin)/appointments/_components/appointments-filter-bar"
import { AppointmentsTable } from "@/app/(admin)/appointments/_components/appointments-table"
import { PageHeading } from "@/components/admin/page-heading"
import {
  fetchAppointments,
  type AppointmentStatus,
  type ConfirmationStatus,
} from "@/lib/api"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const page = Number.parseInt(getSingleValue(resolvedSearchParams.page) ?? "1", 10) || 1
  const search = getSingleValue(resolvedSearchParams.search) ?? ""
  const status = (getSingleValue(resolvedSearchParams.status) ?? "") as
    | AppointmentStatus
    | ""
  const confirmationStatus = (getSingleValue(
    resolvedSearchParams.confirmationStatus,
  ) ?? "") as ConfirmationStatus | ""

  const appointments = await fetchAppointments({
    page,
    pageSize: 10,
    search,
    status: status || null,
    confirmationStatus: confirmationStatus || null,
  })

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Appointment Management"
        title="Appointments Roster"
        description="Search, filter, and inspect the active appointment pipeline the same way a real operations lead would."
        actions={
          <>
            <Link
              href="/appointments/import"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Link>
            <Link
              href="/appointments/new"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </>
        }
      />

      <AppointmentsFilterBar
        key={[search, status, confirmationStatus].join(":")}
        initialSearch={search}
        initialStatus={status}
        initialConfirmationStatus={confirmationStatus}
      />

      <AppointmentsTable data={appointments} />
    </div>
  )
}
