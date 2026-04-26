import { ReminderCopyLab } from "@/app/(admin)/settings/_components/reminder-copy-lab"
import { ReminderRulesPanel } from "@/app/(admin)/settings/_components/reminder-rules-panel"
import { TrustFoundations } from "@/app/(admin)/settings/_components/trust-foundations"
import { PageHeading } from "@/components/admin/page-heading"
import { fetchReminderRules } from "@/lib/api"

export default async function SettingsPage() {
  const reminderRules = await fetchReminderRules()

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="System Settings"
        title="Operational Trust"
        description="Tune reminder cadence, review the trust posture of the workflow, and make the system feel like a product clients can actually imagine using."
      />

      <ReminderRulesPanel initialRules={reminderRules} />
      <ReminderCopyLab reminderRules={reminderRules} />
      <TrustFoundations />
    </div>
  )
}
