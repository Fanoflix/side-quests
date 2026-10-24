import { Fragment } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { toolGroups } from "./tools"
import type { Tool } from "./tools"

export function ToolList({ current }: { current: Tool }) {
  return (
    <nav aria-label="Quests" className="sticky top-24 flex flex-col text-sm">
      {toolGroups.map((group, i) => (
        <Fragment key={group.label}>
          <span
            className={cn(
              "pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground/55",
              i > 0 && "pt-5"
            )}
          >
            {group.label}
          </span>
          {group.tools.map((tool) => {
            const active = tool.slug === current.slug
            return (
              <Link
                key={tool.slug}
                to={tool.to}
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
                {tool.title}
              </Link>
            )
          })}
        </Fragment>
      ))}
    </nav>
  )
}
