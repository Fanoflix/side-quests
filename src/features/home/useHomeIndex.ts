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

export function useHomeIndex() {
  const verb = useCycle(VERBS, 2000)
  const openMenu = useOpenQuestMenu()
  return { verb, tools, first: tools[0], openMenu }
}
