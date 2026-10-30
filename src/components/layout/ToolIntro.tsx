import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function ToolIntro({
  title,
  children,
  hint,
  badge,
  className,
}: {
  title: string
  children: ReactNode
  hint?: ReactNode
  /** Sits beside the title, e.g. the npm link for tools in the package. */
  badge?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-xs text-muted-foreground">{title}</h1>
        {badge}
      </div>
      <p className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">
        {children}
      </p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function IntroLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-muted-foreground/50 underline-offset-4 transition-colors duration-175 ease-snap hover:decoration-foreground"
    >
      {children}
    </a>
  )
}
