"use client"

import * as React from "react"
import { startTransition, useDeferredValue } from "react"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { Search } from "lucide-react"

type AppointmentsFilterBarProps = {
  initialSearch: string
  initialStatus: string
  initialConfirmationStatus: string
}

function AppointmentsFilterBar({
  initialSearch,
  initialStatus,
  initialConfirmationStatus,
}: AppointmentsFilterBarProps) {
  const [filters, setFilters] = useQueryStates(
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
  const [searchValue, setSearchValue] = React.useState(initialSearch)
  const deferredSearch = useDeferredValue(searchValue)

  React.useEffect(() => {
    if (deferredSearch === filters.search) {
      return
    }

    startTransition(() => {
      void setFilters({
        page: 1,
        search: deferredSearch || null,
      })
    })
  }, [deferredSearch, filters.search, setFilters])

  return (
    <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          type="search"
          placeholder="Search by client, title, or external reference"
          className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="space-y-2">
          <span className="text-micro">Status</span>
          <select
            value={initialStatus}
            onChange={(event) =>
              startTransition(() => {
                void setFilters({
                  page: 1,
                  status: event.target.value || null,
                })
              })
            }
            className="h-11 min-w-44 rounded-full border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="reschedule_requested">Reschedule requested</option>
            <option value="canceled">Canceled</option>
            <option value="completed">Completed</option>
            <option value="no_show">No-show</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-micro">Confirmation</span>
          <select
            value={initialConfirmationStatus}
            onChange={(event) =>
              startTransition(() => {
                void setFilters({
                  page: 1,
                  confirmationStatus: event.target.value || null,
                })
              })
            }
            className="h-11 min-w-44 rounded-full border border-input bg-card px-4 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
          >
            <option value="">Any state</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="expired">Expired</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export { AppointmentsFilterBar }
