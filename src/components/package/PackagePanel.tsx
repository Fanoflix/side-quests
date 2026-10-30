import type { ReactNode } from "react"

import { InstallCommand } from "./InstallCommand"
import { NpmLink } from "./NpmLink"

/**
 * "This one's in the package": a heading, the npm link and the install line,
 * under a tool that ships in side-quests-lab. `children` is for whatever that
 * tool needs said on top, like fonts.
 */
export function PackagePanel({
  title,
  command,
  children,
}: {
  title: ReactNode
  command: string
  children?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-y border-border py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-base font-medium">{title}</div>
        <NpmLink />
      </div>
      <InstallCommand command={command} />
      {children && (
        <div className="text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </section>
  )
}
