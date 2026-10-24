import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ToolStageState } from "./useToolStage"

type Props = {
  stage: ToolStageState
  controls: ReactNode
  children: ReactNode
  className?: string
}

function SettingsSheet({ stage, controls }: Pick<Props, "stage" | "controls">) {
  return (
    <DialogPrimitive.Root
      open={stage.sheetOpen}
      onOpenChange={stage.setSheetOpen}
    >
      <DialogPrimitive.Trigger className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex h-11 items-center gap-2 border border-border bg-background px-4 text-sm font-medium shadow-xl transition-colors hover:border-foreground/30">
        <SlidersHorizontal className="size-4" />
        Settings
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-175 ease-snap data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80svh] w-full max-w-lg flex-col border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-200 ease-snap outline-none data-ending-style:translate-y-full data-starting-style:translate-y-full sm:border-x">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <DialogPrimitive.Title className="text-xs text-muted-foreground">
              Settings
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close settings"
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="tool-rail flex flex-col overflow-y-auto overscroll-contain px-5 pt-5 pb-6">
            {controls}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function ToolStage({ stage, controls, children, className }: Props) {
  return (
    <div
      ref={stage.surfaceRef}
      className={cn("stage-surface relative w-full min-w-0", className)}
    >
      {children}
      {stage.rail ? (
        createPortal(controls, stage.rail)
      ) : (
        <SettingsSheet stage={stage} controls={controls} />
      )}
    </div>
  )
}
