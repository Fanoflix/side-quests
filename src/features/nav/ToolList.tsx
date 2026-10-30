import { Fragment } from "react"
import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { toolGroups } from "./tools"
import type { Tool } from "./tools"

function Entry({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative py-1.5 transition-colors duration-175 ease-snap",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 -left-3 h-3.5 w-px -translate-y-1/2 bg-foreground transition-[opacity,scale] duration-175 ease-snap",
          active ? "opacity-100" : "scale-y-0 opacity-0"
        )}
      />
      {children}
    </Link>
  )
}

/**
 * Every quest, on every page, so you can jump straight from one to another
 * or back home. `current` is undefined on the landing page, which is what
 * marks Home as the active entry.
 */
export function ToolList({ current }: { current: Tool | undefined }) {
  return (
    // Its own view-transition layer, like the top bar's: otherwise it's part
    // of the page snapshot that slides a few pixels as it fades, and the list
    // shimmered as two misaligned copies on every page change.
    <nav
      aria-label="Quests"
      className="sticky top-24 flex flex-col text-sm [view-transition-name:quests]"
    >
      <Entry to="/" active={!current}>
        Home
      </Entry>
      {toolGroups.map((group) => (
        <Fragment key={group.label}>
          <span className="pt-5 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground/55">
            {group.label}
          </span>
          {group.tools.map((tool) => (
            <Entry
              key={tool.slug}
              to={tool.to}
              active={tool.slug === current?.slug}
            >
              {tool.title}
            </Entry>
          ))}
        </Fragment>
      ))}
    </nav>
  )
}
