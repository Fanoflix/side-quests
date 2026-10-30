import type { LucideIcon } from "lucide-react"
import {
  Grip,
  Layers,
  MessagesSquare,
  MonitorPlay,
  Orbit,
  Sparkles,
  Spline,
  Table2,
  Type,
} from "lucide-react"

export const CATEGORIES = {
  motion: "Motion",
  canvas: "Before / After",
  recreation: "Recreations",
  speculative: "Speculative UI",
  hood: "Under the hood",
} as const

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES]

export type Tool = {
  slug: string
  to: string
  title: string
  icon: LucideIcon
  category: Category
  hook: string
  description: string
  added: string
  keywords: string[]
  controls?: boolean
  /** Ships as a component in the side-quests-lab npm package. */
  downloadable?: boolean
}

export const tools: Tool[] = [
  {
    slug: "character-flow",
    downloadable: true,
    controls: true,
    to: "/character-flow",
    title: "Character Flow",
    icon: Type,
    category: CATEGORIES.motion,
    hook: "NumberFlow, but for words.",
    description:
      "Type any word and watch it change into another one. Letters spin through the alphabet, and the ones both words share slide over to their new spot.",
    added: "Jul 2026",
    keywords: [
      "numberflow",
      "number flow",
      "odometer",
      "split flap",
      "flip",
      "morph",
      "text transition",
      "animated text",
      "roll",
      "ticker",
    ],
  },
  {
    slug: "dithering",
    controls: true,
    to: "/dithering",
    title: "Dithering",
    icon: Grip,
    category: CATEGORIES.canvas,
    hook: "Old games only had a handful of colours, so they faked the rest with dots.",
    description:
      "Old games only had a handful of colours, so they faked the rest with dots. Drop in any photo and see it with four colours, or two.",
    added: "Jun 2026",
    keywords: [
      "bayer",
      "floyd steinberg",
      "error diffusion",
      "quantize",
      "posterize",
      "halftone",
      "grain",
      "1-bit",
      "ordered",
      "game boy",
    ],
  },
  {
    slug: "low-res-video",
    controls: true,
    to: "/low-res-video",
    title: "Low Res Video",
    icon: MonitorPlay,
    category: CATEGORIES.recreation,
    hook: "How few dots does a video need before you can't tell what it is?",
    description:
      "How few dots does a video need before you can't tell what it is? Turn any clip into a stadium scoreboard and keep shrinking the grid.",
    added: "Jun 2026",
    keywords: [
      "pixel",
      "pixelate",
      "led wall",
      "dot screen",
      "scoreboard",
      "mosaic",
      "downscale",
      "retro",
    ],
  },
  {
    slug: "style-flow",
    downloadable: true,
    controls: true,
    to: "/style-flow",
    title: "Style Flow",
    icon: Sparkles,
    category: CATEGORIES.motion,
    hook: "Every letter picks its own weight, slant and font, live.",
    description:
      "Every letter picks its own weight, slant and font, live in the browser with one variable font. Type your name and watch it shimmer.",
    added: "Jul 2026",
    keywords: [
      "variable font",
      "font weight",
      "italic",
      "serif",
      "typography",
      "shimmer",
      "font variation settings",
      "wght",
      "slnt",
      "recursive",
      "fraunces",
      "animated type",
    ],
  },
  {
    slug: "anti-aliasing",
    controls: true,
    to: "/anti-aliasing",
    title: "Anti-aliasing",
    icon: Spline,
    category: CATEGORIES.canvas,
    hook: "Pixels are square, so every curve on your screen is really a staircase.",
    description:
      "Pixels are square, so every curve on your screen is really a staircase. See how games hide it by looking at each pixel more than once.",
    added: "Jun 2026",
    keywords: [
      "aa",
      "ssaa",
      "msaa",
      "supersampling",
      "jaggies",
      "staircase",
      "smooth edges",
      "coverage",
      "rasterization",
    ],
  },
  {
    slug: "future-table",
    to: "/future-table",
    title: "Concept table",
    icon: Table2,
    category: CATEGORIES.speculative,
    hook: "What if table rows never moved, and only what's in them changed?",
    description:
      "What if table rows never moved, and only what's in them changed? A table that updates like a train station departures board.",
    added: "Jul 2026",
    keywords: [
      "fixed rows",
      "departure board",
      "split flap",
      "slots",
      "pagination",
      "placeholder",
      "future ui",
    ],
  },
  {
    slug: "concept-chat",
    to: "/concept-chat",
    title: "Concept chat",
    icon: MessagesSquare,
    category: CATEGORIES.speculative,
    hook: "What if a text message kept the timing of how you typed it?",
    description:
      "What if a text message kept the timing of how you typed it? Some jokes only land with the pause, so this chat plays the pause back.",
    added: "Jul 2026",
    keywords: [
      "chat",
      "messaging",
      "slack",
      "discord",
      "whatsapp",
      "timeline",
      "timed message",
      "playback",
      "future ui",
    ],
  },
  {
    slug: "tanstack-showcase",
    to: "/tanstack-showcase",
    title: "TanStack, lid off",
    icon: Layers,
    category: CATEGORIES.hood,
    hook: "The same app built three ways, so you can watch the bookkeeping disappear.",
    description:
      "The same ticket app built three ways: plain React, TanStack Query and TanStack DB. Watch the requests, spinners and bookkeeping disappear as you go.",
    added: "Aug 2026",
    keywords: [
      "tanstack",
      "react query",
      "tanstack db",
      "cache",
      "stale time",
      "invalidation",
      "optimistic update",
      "rollback",
      "data fetching",
      "state management",
    ],
  },
  {
    slug: "depth-dust",
    downloadable: true,
    controls: true,
    to: "/depth-dust",
    title: "Depth Dust",
    icon: Orbit,
    category: CATEGORIES.canvas,
    hook: "Half a million specks of light, each one knowing how far away it is.",
    description:
      "Half a million specks of light, each one knowing how far away it is. Drop in any picture and watch it drift apart in 3D.",
    added: "Oct 2026",
    keywords: [
      "point cloud",
      "particles",
      "depth map",
      "depth anything",
      "3d photo",
      "parallax",
      "webgl",
      "dust",
      "swarm",
      "gather",
    ],
  },
]

export function findTool(pathname: string): Tool | undefined {
  const path = pathname.replace(/\/+$/, "")
  return tools.find((tool) => tool.to === path)
}

export function toolBySlug(slug: string): Tool {
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) throw new Error(`Unknown tool: ${slug}`)
  return tool
}

export function questNumber(tool: Tool): string {
  return String(tools.indexOf(tool) + 1).padStart(2, "0")
}

export type ToolGroup = { label: Category; tools: Tool[] }

export const toolGroups: ToolGroup[] = tools.reduce<ToolGroup[]>(
  (groups, tool) => {
    const group = groups.find((g) => g.label === tool.category)
    if (group) group.tools.push(tool)
    else groups.push({ label: tool.category, tools: [tool] })
    return groups
  },
  []
)
