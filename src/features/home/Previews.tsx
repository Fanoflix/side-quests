import type { ReactNode } from "react"

import { CharacterFlow } from "@/features/motion/character-flow/CharacterFlow"
import { StyleFlow } from "@/features/motion/style-flow/StyleFlow"
import { cn } from "@/lib/utils"
import {
  DITHER_IMAGE,
  useAntiAliasPreview,
  useDepthDustPreview,
  useDitherPreview,
  useLowResPreview,
} from "./usePreviews"
import {
  RUNGS,
  TABLE_ROWS,
  useFlowPreview,
  useStylePreview,
  useTablePreview,
  useTanstackPreview,
} from "./usePreviewCycles"

function Label({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute bottom-2 bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/80",
        className
      )}
    >
      {children}
    </span>
  )
}

function CharacterFlowPreview() {
  const { ref, word } = useFlowPreview()
  return (
    <div ref={ref} className="grid size-full place-items-center">
      <CharacterFlow
        value={word}
        className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight"
      />
    </div>
  )
}

function DitherPreview() {
  const { ref, canvasRef } = useDitherPreview()
  return (
    <div ref={ref} className="relative size-full bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full object-cover [image-rendering:pixelated]"
      />
      <img
        src={DITHER_IMAGE}
        alt=""
        loading="lazy"
        className="preview-wipe absolute inset-0 size-full object-cover"
      />
      <Label className="left-2">Before</Label>
      <Label className="right-2">2 colours</Label>
    </div>
  )
}

function LowResPreview() {
  const { ref, canvasRef } = useLowResPreview()
  return (
    <div ref={ref} className="size-full bg-black">
      <canvas ref={canvasRef} className="size-full object-cover" />
    </div>
  )
}

function DepthDustPreview() {
  const { ref, canvasRef } = useDepthDustPreview()
  return (
    <div ref={ref} className="size-full bg-black">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

function StyleFlowPreview() {
  const { ref, token, inView } = useStylePreview()
  return (
    <div
      ref={ref}
      className="grid size-full place-items-center overflow-hidden"
    >
      <StyleFlow
        value="Shimmer"
        playToken={token}
        autoPlay={inView}
        duration={5}
        weights={[300, 400, 500, 600, 700, 800, 900]}
        sizeRange={[40, 56]}
        restStyle={{ weight: 500, family: "sans", size: 48 }}
        className="tracking-[-0.2rem]"
      />
    </div>
  )
}

function AntiAliasPreview() {
  const { canvasRef } = useAntiAliasPreview()
  return (
    <div className="relative size-full bg-black">
      <canvas
        ref={canvasRef}
        className="size-full object-cover [image-rendering:pixelated]"
      />
      <span className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
      <Label className="left-2">1 sample</Label>
      <Label className="right-2">36 samples</Label>
    </div>
  )
}

function TablePreview() {
  const { ref, statuses } = useTablePreview()
  return (
    <div ref={ref} className="grid size-full place-items-center px-6">
      <table className="w-full max-w-sm font-mono text-xs">
        <tbody>
          {TABLE_ROWS.map(([flight, city], i) => (
            <tr key={flight} className="border-b border-border last:border-0">
              <td className="py-2 text-muted-foreground">{flight}</td>
              <td className="py-2">{city}</td>
              <td className="py-2 text-right">
                <CharacterFlow value={statuses[i]} maxSteps={4} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChatPreview() {
  return (
    <div className="flex size-full flex-col justify-end gap-2 p-5 text-sm">
      <span className="w-fit max-w-[80%] bg-accent px-3 py-2">
        so I finally told him the ending
      </span>
      <span
        className="flex w-fit gap-1 bg-accent px-3 py-3"
        aria-label="typing"
      >
        <span className="typing-dot" />
        <span className="typing-dot [animation-delay:150ms]" />
        <span className="typing-dot [animation-delay:300ms]" />
      </span>
    </div>
  )
}

function TanstackPreview() {
  const { ref, active } = useTanstackPreview()
  return (
    <div
      ref={ref}
      className="flex size-full flex-col justify-center gap-1.5 px-6 font-mono text-xs"
    >
      {RUNGS.map((rung, i) => (
        <div
          key={rung.label}
          className={cn(
            "flex items-center justify-between border px-3 py-2 transition-colors duration-175 ease-snap",
            i === active
              ? "border-foreground/40 text-foreground"
              : "border-border text-muted-foreground"
          )}
        >
          <span>{rung.label}</span>
          <span>{rung.requests}</span>
        </div>
      ))}
    </div>
  )
}

export const PREVIEWS: Partial<Record<string, () => ReactNode>> = {
  "character-flow": CharacterFlowPreview,
  dithering: DitherPreview,
  "low-res-video": LowResPreview,
  "style-flow": StyleFlowPreview,
  "anti-aliasing": AntiAliasPreview,
  "future-table": TablePreview,
  "concept-chat": ChatPreview,
  "tanstack-showcase": TanstackPreview,
  "depth-dust": DepthDustPreview,
}
