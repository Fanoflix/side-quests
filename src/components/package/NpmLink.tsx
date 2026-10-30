import { ArrowUpRight, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { NPM_URL } from "@/features/nav/site"
import { cn } from "@/lib/utils"

/**
 * The package's npm page, from any tool that ships in it. Always the same
 * label and icon, so it reads as one thing wherever it appears: `chip` in a
 * tool's title row, the default size beside the install command.
 */
export function NpmLink({
  size = "sm",
  className,
}: {
  size?: "chip" | "sm"
  className?: string
}) {
  return (
    <a
      href={NPM_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        size === "chip"
          ? "inline-flex h-6 items-center gap-1 border border-border px-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
          : buttonVariants({ variant: "outline", size: "sm" }),
        className
      )}
    >
      <Package className={size === "chip" ? "size-3.5" : undefined} />
      side-quests-lab on npm
      <ArrowUpRight
        className={cn("opacity-60", size === "chip" && "size-3.5")}
      />
    </a>
  )
}
