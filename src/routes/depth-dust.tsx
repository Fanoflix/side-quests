import { createFileRoute } from "@tanstack/react-router"
import { DepthDust } from "@/features/canvas-stuff/depth-dust/DepthDust"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/depth-dust")({
  head: () => ({ meta: toolMeta("depth-dust") }),
  component: DepthDust,
})
