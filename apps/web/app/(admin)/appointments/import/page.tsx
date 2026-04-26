import { Upload } from "lucide-react"

import { CsvImportWorkspace } from "@/app/(admin)/appointments/import/_components/csv-import-workspace"
import { PageHeading } from "@/components/admin/page-heading"

export default function AppointmentImportPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Bulk Operations"
        title="Import Appointments"
        description="Upload a CSV, preview the rows, and push valid appointments into the same workflow engine that powers reminders, confirmations, and reschedule handling."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground">
            <Upload className="h-4 w-4 text-secondary" />
            CSV Import
          </div>
        }
      />

      <CsvImportWorkspace />
    </div>
  )
}
