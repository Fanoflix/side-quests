import { Star } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { REPO_URL } from "@/features/nav/site"
import { CharacterFlow } from "./CharacterFlow"
import { usePackageTeaser } from "./usePackageTeaser"

export function PackageTeaser() {
  const { ref, tagline } = usePackageTeaser()

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <code className="font-mono text-sm text-muted-foreground">
            <span className="opacity-50">$ </span>npm i side-quests-lab
          </code>
          <span className="border border-border px-1.5 py-px text-[11px] text-muted-foreground">
            Soon
          </span>
        </div>
        <CharacterFlow value={tagline} className="text-base font-medium" />
      </div>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({
          variant: "outline",
          className: "self-start sm:self-auto",
        })}
      >
        <Star />
        Star to get notified
      </a>
    </div>
  )
}
