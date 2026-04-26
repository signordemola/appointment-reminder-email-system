import { PageHeading } from "@/components/admin/page-heading"
import { NewAppointmentForm } from "@/app/(admin)/appointments/_components/new-appointment-form"

export default function NewAppointmentPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Create Appointment"
        title="New Appointment"
        description="Capture client details, set the schedule, and let the API generate confirmation and reminder events automatically."
      />
      <NewAppointmentForm />
    </div>
  )
}
