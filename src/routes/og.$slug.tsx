import { createFileRoute } from "@tanstack/react-router"
import { OgCard } from "@/features/seo/OgCard"

export const Route = createFileRoute("/og/$slug")({
  component: function OgRoute() {
    const { slug } = Route.useParams()
    return <OgCard slug={slug} />
  },
})
