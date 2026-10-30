import { PREVIEWS } from "@/features/home/Previews"
import { CharacterFlow } from "@/features/motion/character-flow/CharacterFlow"
import { SiteMark } from "@/features/nav/SiteMark"
import { SITE_NAME } from "@/features/nav/site"
import { tools } from "@/features/nav/tools"
import type { Tool } from "@/features/nav/tools"
import { useDepthDustHero, useFrozenRoll } from "./useOgHero"

const BACKDROPS = new Set(["dithering", "anti-aliasing", "low-res-video"])

const ZOOMED: Partial<Record<string, number>> = {
  "style-flow": 3,
  "future-table": 2.2,
  "concept-chat": 2.2,
  "tanstack-showcase": 2,
}

const ROLL = { from: "delayed", to: "departures", progress: 0.65 }

const HOME_TILES = [
  { slug: "character-flow", zoom: 1.6 },
  { slug: "depth-dust", zoom: 1 },
  { slug: "dithering", zoom: 1 },
]

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-og-card
      className="fixed inset-0 z-[100] h-[630px] w-[1200px] overflow-hidden bg-background text-foreground"
    >
      {children}
    </div>
  )
}

function Layout({
  hero,
  children,
}: {
  hero?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex flex-col px-16 py-14">
      <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
        <SiteMark className="size-8" />
        {SITE_NAME}
      </div>
      <div className="relative my-6 flex-1">{hero}</div>
      {children}
    </div>
  )
}

function Shade() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-background from-10% via-background/70 via-40% to-transparent to-70%" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/80 to-transparent" />
    </>
  )
}

function Zoomed({ slug, zoom }: { slug: string; zoom: number }) {
  const Preview = PREVIEWS[slug]
  return (
    <div className="absolute inset-0" style={{ zoom }}>
      {Preview && <Preview />}
    </div>
  )
}

function FlowHero() {
  const { ref, value } = useFrozenRoll(ROLL.from, ROLL.to, ROLL.progress)
  return (
    <div ref={ref} className="absolute inset-0 grid place-items-center">
      <CharacterFlow
        value={value}
        className="text-[180px] font-semibold tracking-tight"
      />
    </div>
  )
}

function DustBackdrop() {
  const { canvasRef } = useDepthDustHero()
  return (
    <canvas
      ref={canvasRef}
      className="absolute -top-8 left-[260px] h-[630px] w-[1000px]"
    />
  )
}

function Backdrop({ slug }: { slug: string }) {
  if (slug === "depth-dust") return <DustBackdrop />
  if (BACKDROPS.has(slug)) return <Zoomed slug={slug} zoom={1} />
  return null
}

function BandHero({ slug }: { slug: string }) {
  if (slug === "character-flow") return <FlowHero />
  const zoom = ZOOMED[slug]
  if (!zoom) return null
  return <Zoomed slug={slug} zoom={zoom} />
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Frame>
      <Backdrop slug={tool.slug} />
      <Shade />
      <Layout hero={<BandHero slug={tool.slug} />}>
        <h1 className="text-[104px] leading-[0.98] font-bold tracking-[-0.035em]">
          {tool.title}
        </h1>
        <p className="mt-4 max-w-[1000px] text-[38px] leading-tight text-balance text-muted-foreground">
          {tool.hook}
        </p>
      </Layout>
    </Frame>
  )
}

function HomeCard() {
  return (
    <Frame>
      <Layout
        hero={
          <div className="absolute inset-0 grid grid-cols-3 gap-px bg-border">
            {HOME_TILES.map(({ slug, zoom }) => (
              <div
                key={slug}
                className="relative overflow-hidden bg-background"
              >
                <Zoomed slug={slug} zoom={zoom} />
              </div>
            ))}
          </div>
        }
      >
        <h1 className="text-[76px] leading-none font-bold tracking-[-0.035em] whitespace-nowrap">
          Small web things that <span className="text-highlight">roll.</span>
        </h1>
        <p className="mt-4 text-[34px] text-muted-foreground">
          {tools.length} quests, each with a plain-English write-up.
        </p>
      </Layout>
    </Frame>
  )
}

export function OgCard({ slug }: { slug: string }) {
  if (!import.meta.env.DEV) return null
  const tool = tools.find((t) => t.slug === slug)
  return tool ? <ToolCard tool={tool} /> : <HomeCard />
}
