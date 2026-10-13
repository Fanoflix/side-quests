import { createFileRoute } from "@tanstack/react-router"
import { Reel } from "@/features/reel/Reel"
import { pageMeta } from "@/features/seo/meta"

export const Route = createFileRoute("/reel")({
  head: () => ({
    meta: pageMeta({
      title: "The reel",
      description:
        "A twenty-second clip from each tool, cut around the moment the trick lands. See the whole site in two minutes.",
      path: "/reel",
    }),
  }),
  component: Reel,
})
