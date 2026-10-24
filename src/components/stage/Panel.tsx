import type { ReactNode } from "react"

export function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 pt-6 first:pt-0">
      <header className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground/55">
          {title}
        </span>
        {action}
      </header>
      {children}
    </section>
  )
}
