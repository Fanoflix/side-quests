import { Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { NPM_URL } from "@/features/nav/site"
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
        </div>
        <CharacterFlow value={tagline} className="text-base font-medium" />
      </div>
      <a
        href={NPM_URL}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({
          variant: "outline",
          className: "self-start sm:self-auto",
        })}
      >
        <Package />
        View on npm
      </a>
    </div>
  )
}
