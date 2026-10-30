import { useCycle } from "@/hooks/useCycle"
import { useOpenQuestMenu } from "@/features/nav/questMenuContext"
import { tools } from "@/features/nav/tools"

const VERBS = [
  "roll.",
  "dither.",
  "glow.",
  "shimmer.",
  "melt.",
  "flip.",
  "wait.",
  "cache.",
]

/**
 * Cards that lead the grid, in this order, ahead of the rest in quest order.
 * Only the landing page reorders: quest numbers, prev/next and the link
 * previews keep following `tools`, so featuring a tool never renumbers one.
 */
const FEATURED = ["depth-dust", "character-flow"]

const featuredFirst = [
  ...FEATURED.flatMap((slug) => tools.filter((t) => t.slug === slug)),
  ...tools.filter((t) => !FEATURED.includes(t.slug)),
]

export function useHomeIndex() {
  const verb = useCycle(VERBS, 2000)
  const openMenu = useOpenQuestMenu()
  return { verb, tools: featuredFirst, first: featuredFirst[0], openMenu }
}
