import { useRef } from "react"
import type { PointerEvent } from "react"

import { lineNormal } from "./field"
import type { DriftLine, Vec2 } from "./field"

/**
 * How far past the picture's edges the pad reaches, in picture heights. The
 * line often wants to start outside the picture — a plume off one corner, say
 * — so the pad shows a margin around it to put the ends in.
 */
export const PAD_MARGIN = 0.2

/** Ends closer than this would leave the line with no direction to speak of. */
const MIN_LENGTH = 0.06

/** Length of the direction tick, in pad units. */
const TICK = 0.16

type Part = "a" | "b" | "line" | "tick"

type Drag = { part: Exclude<Part, "tick">; from: Vec2; line: DriftLine }

const clampPad = (v: number) =>
  Math.min(1 + PAD_MARGIN, Math.max(-PAD_MARGIN, v))

const clampPoint = (p: Vec2) => ({ x: clampPad(p.x), y: clampPad(p.y) })

/**
 * The drift line pad: drag an end to turn the line, drag the line to move it,
 * click the tick to flip which way it blows.
 *
 * The pad is drawn in the picture's own proportions (x scaled by `aspect`), so
 * an angle on the pad is the same angle on the picture. Positions are kept in
 * picture space (0–1 per axis); `pad` converts to drawing units.
 */
export function useLinePad({
  line,
  aspect,
  onChange,
  onDragChange,
}: {
  line: DriftLine
  aspect: number
  onChange: (line: DriftLine) => void
  /** Told when a move starts and ends, so the picture can show the line. */
  onDragChange: (active: boolean) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<Drag | null>(null)

  const toPicture = (e: PointerEvent): Vec2 => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const span = 1 + 2 * PAD_MARGIN
    return {
      x: ((e.clientX - rect.left) / rect.width) * span - PAD_MARGIN,
      y: ((e.clientY - rect.top) / rect.height) * span - PAD_MARGIN,
    }
  }

  // One handler for the whole pad: the part under the pointer says what the
  // drag means. Hit areas are generous invisible shapes in the view, because
  // the visible handles are a few pixels across.
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const part = (e.target as Element)
      .closest("[data-part]")
      ?.getAttribute("data-part") as Part | undefined
    if (!part || e.button !== 0 || drag.current) return
    e.preventDefault()
    if (part === "tick") {
      onChange({ a: line.b, b: line.a })
      // A flip is instant, but it's still worth seeing where the line is.
      onDragChange(true)
      onDragChange(false)
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { part, from: toPicture(e), line }
    onDragChange(true)
  }

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    // The button came up without a pointerup reaching us (context menu).
    if (e.buttons === 0) {
      endDrag()
      return
    }
    const now = toPicture(e)
    const dx = now.x - d.from.x
    const dy = now.y - d.from.y
    const move = (p: Vec2) => clampPoint({ x: p.x + dx, y: p.y + dy })

    // Moving the whole line clamps the move, not each end, so an end that
    // reaches the edge stops the line instead of bending it.
    if (d.part === "line") {
      const { a, b } = d.line
      const lo = -PAD_MARGIN
      const hi = 1 + PAD_MARGIN
      const mx = Math.min(
        hi - Math.max(a.x, b.x),
        Math.max(lo - Math.min(a.x, b.x), dx)
      )
      const my = Math.min(
        hi - Math.max(a.y, b.y),
        Math.max(lo - Math.min(a.y, b.y), dy)
      )
      onChange({
        a: { x: a.x + mx, y: a.y + my },
        b: { x: b.x + mx, y: b.y + my },
      })
      return
    }
    const next =
      d.part === "a"
        ? { a: move(d.line.a), b: d.line.b }
        : { a: d.line.a, b: move(d.line.b) }
    const length = Math.hypot(
      (next.b.x - next.a.x) * aspect,
      next.b.y - next.a.y
    )
    if (length >= MIN_LENGTH) onChange(next)
  }

  const endDrag = () => {
    if (drag.current) onDragChange(false)
    drag.current = null
  }

  const pad = (p: Vec2) => ({
    x: (p.x + PAD_MARGIN) * aspect,
    y: p.y + PAD_MARGIN,
  })

  const a = pad(line.a)
  const b = pad(line.b)
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const normal = lineNormal(line, aspect)
  // The line itself runs on past both ends to the pad's edges (the SVG clips
  // it): the plume is decided by which side of the whole line a point is on,
  // not just the stretch between the handles.
  const far = 10
  const ext = {
    x1: a.x - (b.x - a.x) * far,
    y1: a.y - (b.y - a.y) * far,
    x2: b.x + (b.x - a.x) * far,
    y2: b.y + (b.y - a.y) * far,
  }

  return {
    svgRef,
    width: (1 + 2 * PAD_MARGIN) * aspect,
    height: 1 + 2 * PAD_MARGIN,
    picture: { x: PAD_MARGIN * aspect, y: PAD_MARGIN, w: aspect, h: 1 },
    a,
    b,
    ext,
    mid,
    tip: { x: mid.x + normal.x * TICK, y: mid.y + normal.y * TICK },
    onPointerDown,
    onPointerMove,
    endDrag,
  }
}
