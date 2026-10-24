import { PREVIEWS } from "@/features/home/Previews"
import { SiteMark } from "@/features/nav/SiteMark"
import { SITE_NAME } from "@/features/nav/site"
import { questNumber, tools } from "@/features/nav/tools"
import type { Tool } from "@/features/nav/tools"
import { cn } from "@/lib/utils"

const HOME_PREVIEWS = [
  "character-flow",
  "dithering",
  "low-res-video",
  "style-flow",
]

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-og-card
      className="fixed inset-0 z-[100] flex h-[630px] w-[1200px] bg-background text-foreground"
    >
      {children}
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 text-xl font-semibold tracking-tight">
      <SiteMark className="size-7" />
      {SITE_NAME}
    </div>
  )
}

function Panel({ slug, className }: { slug: string; className?: string }) {
  const Preview = PREVIEWS[slug]
  return (
    <div
      className={cn(
        "overflow-hidden border border-border bg-muted/30",
        className
      )}
    >
      {Preview && <Preview />}
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Frame>
      <div className="flex w-[560px] shrink-0 flex-col justify-between p-16">
        <Brand />
        <div className="space-y-5">
          <p className="text-base text-muted-foreground">
            Quest {questNumber(tool)} · {tool.category}
          </p>
          <h1 className="text-6xl font-semibold tracking-tight">
            {tool.title}
          </h1>
          <p className="text-3xl leading-snug text-balance text-muted-foreground">
            {tool.hook}
          </p>
        </div>
        <p className="font-mono text-base text-muted-foreground">
          fanoflix.github.io/side-quests{tool.to}
        </p>
      </div>
      <div className="flex flex-1 items-center py-16 pr-16">
        <Panel slug={tool.slug} className="aspect-[16/10] w-full" />
      </div>
    </Frame>
  )
}

function HomeCard() {
  return (
    <Frame>
      <div className="flex w-[600px] shrink-0 flex-col justify-between p-16">
        <Brand />
        <h1 className="text-7xl font-semibold tracking-tight">
          Small web things that <span className="text-highlight">roll.</span>
        </h1>
        <p className="text-2xl text-muted-foreground">
          {tools.length} quests, each with a plain-English write-up.
        </p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 py-16 pr-16">
        {HOME_PREVIEWS.map((slug) => (
          <Panel key={slug} slug={slug} />
        ))}
      </div>
    </Frame>
  )
}

export function OgCard({ slug }: { slug: string }) {
  if (!import.meta.env.DEV) return null
  const tool = tools.find((t) => t.slug === slug)
  return tool ? <ToolCard tool={tool} /> : <HomeCard />
}
