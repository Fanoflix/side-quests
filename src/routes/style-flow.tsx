import { createFileRoute } from "@tanstack/react-router"
import { StyleFlowDemo } from "@/features/motion/style-flow/StyleFlowDemo"
import { toolMeta } from "@/features/seo/meta"

const MAX_TEXT = 32

export const Route = createFileRoute("/style-flow")({
  validateSearch: (search: Record<string, unknown>): { text?: string } =>
    typeof search.text === "string" && search.text.trim()
      ? { text: search.text.slice(0, MAX_TEXT) }
      : {},
  head: () => ({ meta: toolMeta("style-flow") }),
  component: StyleFlowDemo,
})
