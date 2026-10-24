import { createFileRoute } from "@tanstack/react-router"
import { ConceptChatDemo } from "@/features/speculative-ui/concept-chat/demo/ConceptChatDemo"
import { toolMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/concept-chat")({
  head: () => ({ meta: toolMeta("concept-chat") }),
  component: ConceptChatDemo,
})
