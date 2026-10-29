import { useRef, useState } from "react"
import type { PointerEvent, RefObject } from "react"

export type Pan = { yaw: number; pitch: number }

/**
 * Dragging turns the camera, at this many radians per CSS pixel at a pan speed
 * of 1, up to these limits. Past ~50° of yaw the sheet is nearly edge-on and
 * the picture is gone; past ~25° of pitch the extruded subject starts to look
 * like a cardboard cut-out, because the depth map only knows about the front
 * of things.
 */
const PAN_PER_PX = 0.005
const MAX_YAW = 0.9
const MAX_PITCH = 0.45

/**
 * Each frame the view closes this share of the gap to where you dragged it.
 * Following the pointer exactly felt like grabbing a sheet of glass; a short
 * lag gives the cloud a little weight.
 */
const PAN_EASE = 0.14

/** Pan speed multiplies `PAN_PER_PX`, within these bounds. */
export const MIN_PAN_SPEED = 0.25
export const MAX_PAN_SPEED = 3

const clamp = (v: number, max: number) => Math.min(max, Math.max(-max, v))

/**
 * Drag-to-turn for the field. Shared by the tool page and the published
 * component, so the two always feel the same in the hand.
 *
 * Where the drag wants the camera, where it is now (easing towards the
 * target), and where the current drag started are refs, not state: they change
 * every pointer event and every frame, and only the GL draw reads them. The
 * frame loop calls `step` once per frame and keeps running while it returns
 * true; `wake` restarts a loop that has stopped (only ever the case with
 * reduced motion, where the loop draws one frame and then waits for a drag).
 */
export function usePan({
  enabled,
  speed,
  wake,
}: {
  enabled: boolean
  speed: number
  wake: RefObject<() => void>
}) {
  const target = useRef<Pan>({ yaw: 0, pitch: 0 })
  const pan = useRef<Pan>({ yaw: 0, pitch: 0 })
  const dragFrom = useRef<{ x: number; y: number; pan: Pan } | null>(null)
  const [dragging, setDragging] = useState(false)

  const step = () => {
    const now = pan.current
    now.yaw += (target.current.yaw - now.yaw) * PAN_EASE
    now.pitch += (target.current.pitch - now.pitch) * PAN_EASE
    return (
      Math.abs(target.current.yaw - now.yaw) +
        Math.abs(target.current.pitch - now.pitch) >
      0.001
    )
  }

  // Pointer capture keeps the drag alive when the pointer leaves the canvas,
  // which it nearly always does on a long sideways drag.
  // Primary button only, and a drag ends if the button turns out to be up:
  // a right-click opens a context menu, and the browser can swallow the
  // pointerup, which left the picture following the pointer with nothing held.
  const onPointerDown = (e: PointerEvent<Element>) => {
    if (!enabled || e.button !== 0 || dragFrom.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragFrom.current = { x: e.clientX, y: e.clientY, pan: target.current }
    setDragging(true)
  }

  const onPointerMove = (e: PointerEvent<Element>) => {
    const from = dragFrom.current
    if (!from) return
    if (e.buttons === 0) {
      endDrag()
      return
    }
    const rate = PAN_PER_PX * speed
    // Dragging up tips the top of the picture away from you, as if your finger
    // were on its surface. Adding the pointer's y (which grows downwards) did
    // the opposite and felt inverted.
    target.current = {
      yaw: clamp(from.pan.yaw + (e.clientX - from.x) * rate, MAX_YAW),
      pitch: clamp(from.pan.pitch - (e.clientY - from.y) * rate, MAX_PITCH),
    }
    wake.current()
  }

  const endDrag = () => {
    dragFrom.current = null
    setDragging(false)
  }

  /** Ease back to facing the picture straight on. */
  const reset = () => {
    endDrag()
    target.current = { yaw: 0, pitch: 0 }
    wake.current()
  }

  return { pan, step, dragging, onPointerDown, onPointerMove, endDrag, reset }
}
