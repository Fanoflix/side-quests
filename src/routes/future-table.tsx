import { createFileRoute } from "@tanstack/react-router"
import { FutureTableDemo } from "@/features/speculative-ui/future-table/demo/FutureTableDemo"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/future-table")({
  head: () => ({ meta: toolMeta("future-table") }),
  component: FutureTableDemo,
})
