import { Link } from "@tanstack/react-router"
import { ArrowRight, ArrowUpRight, Search } from "lucide-react"

import { CharacterFlow } from "@/features/motion/character-flow/CharacterFlow"
import { SearchHint } from "@/features/nav/SearchHint"
import { AUTHOR, AUTHOR_URL, SITE_NAME } from "@/features/nav/site"
import { questNumber } from "@/features/nav/tools"
import { cn } from "@/lib/utils"
import { PREVIEWS } from "./Previews"
import { useHomeIndex } from "./useHomeIndex"

const SPANS: Record<string, string> = {
  "character-flow": "sm:col-span-2",
  "tanstack-showcase": "sm:col-span-2 lg:col-span-1",
}

const PREVIEW_ASPECT: Record<string, string> = {
  "character-flow": "lg:aspect-[32/9]",
}

const QUIET_PREVIEW = new Set([
  "character-flow",
  "style-flow",
  "future-table",
  "concept-chat",
  "tanstack-showcase",
])

export function HomeIndex() {
  const { verb, tools, first, openMenu } = useHomeIndex()

  return (
    <div className="w-full max-w-6xl space-y-16 sm:space-y-20">
      <section className="max-w-3xl space-y-6 pt-4 sm:pt-10">
        <p className="text-xs text-muted-foreground">
          {SITE_NAME} · {String(tools.length).padStart(2, "0")} so far
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Small web things that{" "}
          <CharacterFlow value={verb} className="text-highlight" />
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Built by{" "}
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {AUTHOR}
          </a>{" "}
          whenever something on the web looked too satisfying to leave alone.
          Each one comes with a short, plain-English write-up of how it works.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={first.to}
            className="group flex h-11 items-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110"
          >
            Start with {first.title}
            <ArrowRight className="size-4 transition-transform duration-175 ease-snap group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={openMenu}
            className="group flex h-11 items-center gap-2 border border-border px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Search className="size-4" />
            Find a quest
            <SearchHint />
          </button>
        </div>
      </section>

      <section
        aria-label="Quests"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tools.map((tool) => {
          const Preview = PREVIEWS[tool.slug]
          return (
            <Link
              key={tool.slug}
              to={tool.to}
              className={cn(
                "group flex flex-col border border-border transition-colors duration-175 ease-snap hover:border-foreground/30",
                SPANS[tool.slug]
              )}
            >
              <div
                className={cn(
                  "relative aspect-[16/9] overflow-hidden border-b border-border",
                  PREVIEW_ASPECT[tool.slug],
                  QUIET_PREVIEW.has(tool.slug) && "bg-muted/30"
                )}
              >
                <div className="size-full transition-transform duration-175 ease-snap group-hover:scale-[1.02]">
                  {Preview && <Preview />}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono">{questNumber(tool)}</span>
                  <span aria-hidden>·</span>
                  <span>{tool.category}</span>
                  <ArrowUpRight className="ml-auto size-4 transition-transform duration-175 ease-snap group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h2 className="text-lg font-medium tracking-tight">
                  {tool.title}
                </h2>
                <p className="text-sm text-pretty text-muted-foreground">
                  {tool.hook}
                </p>
              </div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
