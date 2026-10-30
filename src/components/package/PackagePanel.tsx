import type { ReactNode } from "react"

import { CodeBlock } from "./CodeBlock"
import { InstallCommand } from "./InstallCommand"
import { NpmLink } from "./NpmLink"

/**
 * "This one's in the package": a heading, the npm link, the install line and
 * a usage snippet, under a tool that ships in side-quests-lab. The same
 * pieces, in the same order, as Depth Dust's longer card, so the three pages
 * read as one thing. `children` is a short note under the snippet.
 */
export function PackagePanel({
  title,
  command,
  usage,
  children,
}: {
  title: ReactNode
  command: string
  usage: string
  children?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-y border-border py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-base font-medium">{title}</div>
        <NpmLink />
      </div>
      <InstallCommand command={command} />
      <CodeBlock code={usage} />
      {children && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
    </section>
  )
}
