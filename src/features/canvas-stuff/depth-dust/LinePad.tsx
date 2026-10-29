import { useLinePad } from "./useLinePad"
import type { DriftLine } from "./field"

type Props = {
  line: DriftLine
  aspect: number
  onChange: (line: DriftLine) => void
  onDragChange: (active: boolean) => void
}

const HANDLE = 0.035
const HIT = 0.1

/**
 * CSS has no built-in "rotate" cursor, so the end handles get a drawn one: a
 * circular arrow, white with a dark outline so it reads on both themes. The
 * hotspot is its centre, and `grab` is the fallback if the image can't load.
 */
const ROTATE_ARROW = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">',
  '<g stroke="black" stroke-width="4.5"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/></g>',
  '<g stroke="white" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/></g>',
  "</svg>",
].join("")
const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ROTATE_ARROW)}") 12 12, grab`

export function LinePad({ line, aspect, onChange, onDragChange }: Props) {
  const {
    svgRef,
    width,
    height,
    picture,
    a,
    b,
    ext,
    mid,
    tip,
    onPointerDown,
    onPointerMove,
    endDrag,
  } = useLinePad({ line, aspect, onChange, onDragChange })

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Drift line. Drag the ends to turn it, the line to move it, and the tick to flip it."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="block w-full touch-none overflow-hidden border border-border bg-muted/20 select-none"
    >
      <rect
        x={picture.x}
        y={picture.y}
        width={picture.w}
        height={picture.h}
        className="fill-muted stroke-border"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      <line
        {...ext}
        className="stroke-foreground"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        {...ext}
        data-part="line"
        className="cursor-grab stroke-transparent active:cursor-grabbing"
        strokeWidth={14}
        vectorEffect="non-scaling-stroke"
      />

      <line
        x1={mid.x}
        y1={mid.y}
        x2={tip.x}
        y2={tip.y}
        className="stroke-foreground"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={tip.x}
        cy={tip.y}
        r={HANDLE * 0.7}
        className="fill-foreground"
      />
      <circle
        cx={tip.x}
        cy={tip.y}
        r={HIT * 0.8}
        data-part="tick"
        className="cursor-pointer fill-transparent"
      />

      {(["a", "b"] as const).map((part) => {
        const p = part === "a" ? a : b
        return (
          <g key={part}>
            <circle
              cx={p.x}
              cy={p.y}
              r={HANDLE}
              className="fill-background stroke-foreground"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={HIT}
              data-part={part}
              className="fill-transparent"
              style={{ cursor: ROTATE_CURSOR }}
            />
          </g>
        )
      })}
    </svg>
  )
}
