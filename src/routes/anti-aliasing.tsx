import { createFileRoute } from "@tanstack/react-router"
import { AntiAlias } from "@/features/canvas-stuff/anti-aliasing/AntiAlias"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/anti-aliasing")({
  head: () => ({ meta: toolMeta("anti-aliasing") }),
  component: AntiAlias,
})
