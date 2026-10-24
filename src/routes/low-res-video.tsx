import { createFileRoute } from "@tanstack/react-router"
import { LowResVideo } from "@/features/canvas-stuff/low-res-video/LowResVideo"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/low-res-video")({
  head: () => ({ meta: toolMeta("low-res-video") }),
  component: LowResVideo,
})
