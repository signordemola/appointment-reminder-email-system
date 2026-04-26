import { CircleAlert } from "lucide-react"

type PublicErrorStateProps = {
  title: string
  message: string
}

function PublicErrorState({ title, message }: PublicErrorStateProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="surface-panel overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-slate-300" />
        <div className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/12 text-rose-500">
            <CircleAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-micro">Action Link Unavailable</p>
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground">{title}</h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/60 px-5 py-4 text-left text-sm text-muted-foreground">
            If you still need help with this appointment, reply to the original email so the
            business can issue a fresh action link.
          </div>
        </div>
      </div>
    </div>
  )
}

export { PublicErrorState }
