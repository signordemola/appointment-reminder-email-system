import { Bell, CircleHelp, Search, UserCircle2 } from "lucide-react"

function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur xl:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-micro">Operational Command</p>
          <h2 className="text-lg font-bold text-foreground">Appointment Operations</h2>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <label className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search appointments"
              type="search"
              placeholder="Search appointments, clients, or references"
              className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          {[Bell, CircleHelp, UserCircle2].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export { Topbar }
