import { useState } from "react"
import { Film } from "lucide-react"
import { Link } from "@tanstack/react-router"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { IntroLink, ToolIntro } from "@/components/layout/ToolIntro"
import { cn } from "@/lib/utils"
import type { ReelItem } from "./reel-items"
import { useReel } from "./useReel"

/**
 * `BASE_URL` already carries the right prefix at build time (`/webfun/` in
 * production, `/` in dev). Dropping the trailing slash before concatenating
 * avoids a double slash when the base is already `/`.
 */
const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/${path}`

/**
 * How wide the sheet gets at each breakpoint. The brief: half the screen on
 * `xl+`, three-quarters on `sm`/`md`, three-fifths everywhere else — so a
 * `base → sm → lg → xl` cascade covers it. `sm:max-w-none` undoes the Sheet's
 * default 24rem cap, which would otherwise pin the panel to a sidebar width
 * on everything above `sm`.
 */
const SHEET_WIDTH =
  "w-[60%]! sm:w-[75%]! lg:w-[60%]! xl:w-[50%]! max-w-none! sm:max-w-none! data-[starting-style]:opacity-100! data-[starting-style]:translate-x-0!"

/**
 * View only. All state (open/closed, catalogue) lives in `useReel`.
 *
 * The page is a trigger — one big "Watch the reel" button — plus the sheet
 * itself. Inviting them to click rather than scrolling a long page keeps the
 * reel contained and makes the sheet the thing readers notice first.
 */
export function Reel() {
  const { items } = useReel()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 self-start">
      <ToolIntro title="The reel">
        One 20-second clip from each tool, cut around the moment the trick
        lands. See the whole site in two minutes — or pick a tile and jump into
        the real thing. Captured locally while filming, kept{" "}
        <IntroLink href="/webfun/">here</IntroLink> because they double as the
        site's own trailer.
      </ToolIntro>

      <Sheet>
        <SheetTrigger className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-none border border-transparent bg-primary px-4 text-xs font-semibold tracking-widest whitespace-nowrap text-primary-foreground uppercase outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/30">
          <Film className="size-4" />
          Watch the reel
        </SheetTrigger>
        <SheetContent side="right" className={cn(SHEET_WIDTH)}>
          <SheetHeader className="shrink-0 border-b border-border">
            <SheetTitle>The reel</SheetTitle>
            <SheetDescription>
              One moment per tool. Each tile links out to the full thing.
            </SheetDescription>
          </SheetHeader>

          <ol className="min-h-0 flex-1 space-y-10 overflow-y-auto p-8">
            {items.map((item) => (
              <ReelTile key={item.to} item={item} />
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * One tile in the sheet. The GIF is loaded as a plain `<img>` — fine for the
 * sizes we're shipping and keeps the markup inspectable. A missing file falls
 * through to an inline placeholder rather than a broken-image icon, so the
 * tiles still read while the clips are being captured.
 */
function ReelTile({ item }: { item: ReelItem }) {
  const Icon = item.icon
  return (
    <li className="space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          <h3 className="text-base font-semibold tracking-tight">
            {item.title}
          </h3>
        </div>
        <Link
          to={item.to}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open tool →
        </Link>
      </header>

      <ReelFrame src={asset(`reel/${item.gif}`)} alt={item.title} />

      <p className="text-xs tracking-widest text-muted-foreground uppercase">
        {item.beat}
      </p>
      <p className="text-sm leading-relaxed text-pretty text-foreground">
        {item.line}
      </p>
    </li>
  )
}

/**
 * The GIF frame.
 *
 * Falls through to a placeholder when the file is missing, so the sheet reads
 * cleanly while the clips are still being captured. A plain `<img>` is fine
 * for the sizes we ship — a video element would buy nothing and would need
 * controls, autoplay and codec plumbing.
 */
function ReelFrame({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-muted/30">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-muted-foreground uppercase">
          Clip pending
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
