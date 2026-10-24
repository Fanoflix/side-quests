import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { HowItWorks } from "@/features/explainers/HowItWorks"
import { questNumber } from "./tools"
import type { Tool } from "./tools"

function QuestLink({
  tool,
  direction,
}: {
  tool: Tool
  direction: "prev" | "next"
}) {
  const isNext = direction === "next"
  return (
    <Link
      to={tool.to}
      className={`group flex min-w-0 flex-1 flex-col gap-2 border border-border p-5 transition-colors hover:border-foreground/30 hover:bg-accent/40 ${isNext ? "items-end text-right" : ""}`}
    >
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {!isNext && (
          <ArrowLeft className="size-3.5 transition-transform duration-175 ease-snap group-hover:-translate-x-0.5" />
        )}
        {isNext ? "Next quest" : "Previous quest"} · {questNumber(tool)}
        {isNext && (
          <ArrowRight className="size-3.5 transition-transform duration-175 ease-snap group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="text-lg font-medium tracking-tight">{tool.title}</span>
      <span className="text-sm text-pretty text-muted-foreground">
        {tool.hook}
      </span>
    </Link>
  )
}

export function ToolFooter({
  tool,
  prev,
  next,
}: {
  tool: Tool
  prev: Tool
  next: Tool
}) {
  return (
    <section className="w-full space-y-16 pt-16 pb-12">
      <HowItWorks slug={tool.slug} />
      <nav aria-label="More quests" className="flex flex-col gap-3 sm:flex-row">
        <QuestLink tool={prev} direction="prev" />
        <QuestLink tool={next} direction="next" />
      </nav>
    </section>
  )
}
