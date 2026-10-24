import { createFileRoute } from "@tanstack/react-router"
import { CharacterFlowDemo } from "@/features/motion/character-flow/CharacterFlowDemo"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/character-flow")({
  head: () => ({ meta: toolMeta("character-flow") }),
  component: CharacterFlowDemo,
})
