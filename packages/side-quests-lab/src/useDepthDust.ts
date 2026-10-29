import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { createField } from "../../../src/features/canvas-stuff/depth-dust/field"
import type {
  DepthMap,
  DustSettings,
  Field,
  Picture,
} from "../../../src/features/canvas-stuff/depth-dust/field"
import {
  loadDepth,
  loadImage,
} from "../../../src/features/canvas-stuff/depth-dust/picture"
import { usePan } from "../../../src/features/canvas-stuff/depth-dust/usePan"

/**
 * Where the depth comes from: a depth-map image URL (greyscale, white =
 * near), a map already in memory, or a function that works one out from the
 * picture — `estimateDepth` from `side-quests-lab/estimate` is one.
 */
export type DepthMapSource =
  | string
  | DepthMap
  | ((src: string) => Promise<DepthMap>)

const INTRO_MS = 2600

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReduce(onChange: () => void) {
  const query = window.matchMedia(REDUCE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const prefersReduce = () => window.matchMedia(REDUCE_QUERY).matches

async function resolveDepth(src: string, source: DepthMapSource) {
  if (typeof source === "string") return loadDepth(source)
  if (typeof source === "function") return source(src)
  return source
}

/**
 * The published component's state. The same field, pan and depth loading as
 * the tool page, minus everything that belongs to the page: the stage, the
 * file picker, the status line and the site's theme toggle.
 */
export function useDepthDust({
  src,
  depthMap,
  settings,
  light,
  driftSpeed,
  points,
  panEnabled,
  panSpeed,
  playToken,
  onError,
}: {
  src: string
  depthMap: DepthMapSource
  settings: DustSettings
  light: boolean
  driftSpeed: number
  points: number | undefined
  panEnabled: boolean
  panSpeed: number
  playToken: number
  onError: ((error: unknown) => void) | undefined
}) {
  const [picture, setPicture] = useState<Picture | null>(null)
  const reduce = useSyncExternalStore(
    subscribeReduce,
    prefersReduce,
    () => false
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<Field | null>(null)
  const introStart = useRef(0)
  const driftClock = useRef(0)
  const wake = useRef(() => {})
  const pan = usePan({ enabled: panEnabled, speed: panSpeed, wake })
  // Read inside effects without making them re-run when the caller passes a
  // new inline function every render.
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  // Same for settings: callers build the object inline, so it's new every
  // render. Read from a ref in the frame loop instead of restarting the loop
  // on every render — a parent that re-renders each frame used to reset the
  // loop's clock each frame, and the plume froze.
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // createField throws if the driver rejects the shaders; report it rather
    // than letting it take down the caller's page.
    let field: Field | null = null
    try {
      field = createField(canvas, points)
    } catch (error) {
      onErrorRef.current?.(error)
      return
    }
    if (!field) {
      onErrorRef.current?.(new Error("WebGL2 is not available"))
      return
    }
    fieldRef.current = field
    return () => {
      field.dispose()
      fieldRef.current = null
    }
  }, [points])

  // A function or in-memory map passed inline would be a new value every
  // render; only a URL change (or a new picture) should reload.
  const depthKey = typeof depthMap === "string" ? depthMap : null
  useEffect(() => {
    let cancelled = false
    Promise.all([loadImage(src), resolveDepth(src, depthMap)])
      .then(([image, depth]) => {
        if (cancelled) return
        setPicture({
          image,
          depth,
          aspect: image.naturalWidth / image.naturalHeight,
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) onErrorRef.current?.(error)
      })
    return () => {
      cancelled = true
    }
  }, [src, depthKey])

  useEffect(() => {
    if (!picture) return
    fieldRef.current?.setPicture(picture)
    introStart.current = performance.now()
  }, [picture, points, playToken])

  useEffect(() => {
    const field = fieldRef.current
    if (!field || !picture) return
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      frame = 0
      const settling = pan.step()
      if (!reduce && last) {
        driftClock.current += ((now - last) / 1000) * driftSpeed
      }
      last = now
      field.draw({
        time: reduce ? 0 : now / 1000,
        driftTime: driftClock.current,
        intro: reduce ? 1 : Math.min(1, (now - introStart.current) / INTRO_MS),
        settings: settingsRef.current,
        light,
        pan: pan.pan.current,
        guide: 0,
      })
      if (!reduce || settling) frame = requestAnimationFrame(tick)
    }
    wake.current = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      wake.current = () => {}
    }
  }, [picture, light, reduce, driftSpeed, points, playToken])

  useEffect(() => {
    if (!panEnabled) pan.reset()
  }, [panEnabled])

  return {
    canvasRef,
    dragging: pan.dragging,
    onPointerDown: pan.onPointerDown,
    onPointerMove: pan.onPointerMove,
    endDrag: pan.endDrag,
  }
}
