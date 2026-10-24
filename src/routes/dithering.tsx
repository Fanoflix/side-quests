import { createFileRoute } from "@tanstack/react-router"
import { Dither } from "@/features/canvas-stuff/dithering/Dither"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/dithering")({
  head: () => ({ meta: toolMeta("dithering") }),
  component: Dither,
})
