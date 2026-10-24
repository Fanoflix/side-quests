import { createFileRoute } from "@tanstack/react-router"
import { TanstackShowcase } from "@/features/under-the-hood/tanstack-showcase/demo/TanstackShowcase"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/tanstack-showcase")({
  head: () => ({ meta: toolMeta("tanstack-showcase") }),
  component: TanstackShowcase,
})
