import { CornerDownLeft, Search } from "lucide-react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { questNumber } from "./tools"
import type { useQuestMenu } from "./useQuestMenu"

type Props = ReturnType<typeof useQuestMenu>

export function QuestMenu({
  open,
  onOpenChange,
  query,
  setQuery,
  results,
  activeIndex,
  setActive,
  choose,
  onInputKeyDown,
}: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-175 ease-snap data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed top-[12vh] left-1/2 z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 border border-border bg-popover text-popover-foreground shadow-2xl transition-[opacity,translate,scale] duration-175 ease-snap outline-none data-ending-style:-translate-y-1 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <DialogPrimitive.Title className="sr-only">
            Find a quest
          </DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Find a quest…"
              aria-label="Find a quest"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul
            className="max-h-[min(24rem,60vh)] overflow-y-auto p-1.5"
            role="listbox"
          >
            {results.map((tool, i) => (
              <li
                key={tool.slug}
                role="option"
                aria-selected={i === activeIndex}
              >
                <button
                  type="button"
                  onClick={() => choose(tool)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100",
                    i === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="w-6 font-mono text-[11px] tabular-nums opacity-60">
                    {questNumber(tool)}
                  </span>
                  <tool.icon className="size-4 shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm text-foreground">
                      {tool.title}
                    </span>
                    <span className="truncate text-xs">{tool.hook}</span>
                  </span>
                  {i === activeIndex && (
                    <CornerDownLeft className="size-3.5 shrink-0 opacity-60" />
                  )}
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No quest matches “{query}”.
              </li>
            )}
          </ul>
          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>↑↓ to move</span>
            <span>↵ to open</span>
            <span className="ml-auto">[ and ] jump between quests</span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
