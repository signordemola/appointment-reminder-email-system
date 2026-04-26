import type { ReactNode } from "react"

type PageHeadingProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}

function PageHeading({ eyebrow, title, description, actions }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-border/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-micro">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export { PageHeading }
