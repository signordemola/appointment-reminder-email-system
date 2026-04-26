import {
  Clock3,
  MailCheck,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react"

const pillars: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: "Tokenized Actions",
    description:
      "Confirm and reschedule flows are driven by expiring action tokens, which keeps the public links tightly scoped and demo-safe.",
    icon: ShieldCheck,
  },
  {
    title: "Delivery Visibility",
    description:
      "The dashboard tracks sent, failed, and bounced reminder events so the workflow looks operational, not just presentational.",
    icon: MailCheck,
  },
  {
    title: "Timezone Discipline",
    description:
      "Date-time handling is wired around explicit timezones instead of browser-local guesses, which is exactly the kind of boring detail clients care about.",
    icon: Clock3,
  },
  {
    title: "Workflow Continuity",
    description:
      "CSV import, reminder dispatch, confirmation, reschedule, and review all connect back to the same appointment state model.",
    icon: Workflow,
  },
]

function TrustFoundations() {
  return (
    <section className="surface-panel p-6">
      <div className="mb-6 space-y-2">
        <p className="text-micro">Operational Trust</p>
        <h2 className="text-2xl font-bold text-foreground">Why This Demo Feels Credible</h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          This section is intentionally product-facing. It turns the underlying engineering choices
          into client-visible trust signals instead of leaving the page empty.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon

          return (
            <article key={pillar.title} className="surface-inset p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-sm">
                <Icon className="h-5 w-5 text-secondary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{pillar.description}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { TrustFoundations }
