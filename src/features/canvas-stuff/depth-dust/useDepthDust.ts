import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useReducedMotion } from "motion/react"

import { useToolStage } from "@/components/stage/useToolStage"
import { estimateDepth } from "./depth"
import { depthToPng, loadDepth, loadImage } from "./picture"
import { depthFileName } from "./snippet"
import { usePan } from "./usePan"
import { createField, pictureSize } from "./field"
import {
  DEFAULT_ANGLE,
  DEFAULT_DRIFT_SPEED,
  DEFAULT_PAN_SPEED,
  DEFAULT_SETTINGS,
} from "./defaults"
import type { DustSettings, Field, Picture } from "./field"

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "")

/**
 * The picture the tool opens with, and its depth map, worked out ahead of time
 * with `yarn depth` so the page never has to fetch the model just to show
 * something.
 */
export const DEFAULT_PICTURE = `${BASE}/chat-assets/images/lk-helm.webp`
export const DEFAULT_DEPTH = `${BASE}/depth-dust-depth.png`

/** How long the cloud takes to gather into the picture. */
const INTRO_MS = 2600

/** Drift speed multiplies how fast the plume travels, within these bounds. */
export const MIN_DRIFT_SPEED = 0.25
export const MAX_DRIFT_SPEED = 8

/** Reach multiplies how far the plume travels, within these bounds. */
export const MIN_REACH = 0.25
export const MAX_REACH = 8

/**
 * The drift line shows on the picture while you move it in the pad, holds for
 * this long after you let go, then fades out over `GUIDE_FADE_MS`.
 */
const GUIDE_HOLD_MS = 1000
const GUIDE_FADE_MS = 300

/** Stage height as a share of its width, within these bounds. */
const STAGE_RATIO = 0.6
const MIN_STAGE_H = 340
const MAX_STAGE_H = 640

export type DustStatus =
  | { kind: "idle" }
  | { kind: "downloading"; progress: number }
  | { kind: "reading" }
  | { kind: "error" }
  | { kind: "unsupported" }

export async function loadDefaultPicture(): Promise<Picture> {
  const [image, depth] = await Promise.all([
    loadImage(DEFAULT_PICTURE),
    loadDepth(DEFAULT_DEPTH),
  ])
  return { image, depth, aspect: image.naturalWidth / image.naturalHeight }
}

/**
 * The theme lives on `<html>` as a class that the toggle flips, outside React.
 * Watching the attribute means the field follows the toggle live, and no theme
 * state has to be threaded down from the top bar.
 */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

const isLight = () => !document.documentElement.classList.contains("dark")

/**
 * All of Depth Dust's state: the WebGL field's lifetime, the picture (default,
 * or yours with its depth estimated in the browser), the sliders, the theme,
 * and the animation loop that ties them together.
 */
export function useDepthDust() {
  const [settings, setSettings] = useState<DustSettings>(DEFAULT_SETTINGS)
  const [picture, setPicture] = useState<Picture | null>(null)
  const [status, setStatus] = useState<DustStatus>({ kind: "idle" })
  const [panEnabled, setPanEnabled] = useState(true)
  const [panSpeed, setPanSpeed] = useState(DEFAULT_PAN_SPEED)
  const [driftSpeed, setDriftSpeed] = useState(DEFAULT_DRIFT_SPEED)
  const [comparing, setComparing] = useState(false)
  const [pictureUrl, setPictureUrl] = useState(DEFAULT_PICTURE)
  const [pictureName, setPictureName] = useState(
    DEFAULT_PICTURE.split("/").pop() ?? "picture.jpg"
  )
  const stage = useToolStage()
  const light = useSyncExternalStore(subscribeTheme, isLight, () => false)
  const reduce = useReducedMotion() ?? false

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<Field | null>(null)
  const introStart = useRef(0)
  const urlRef = useRef<string | null>(null)
  // Bumped on every pick, so a slow estimate for an older picture can't land
  // on top of a newer one.
  const pickId = useRef(0)
  // Restarts the frame loop when it has stopped — only ever the case with
  // reduced motion, where the loop draws one frame and then waits for a drag.
  const wake = useRef(() => {})
  const pan = usePan({
    enabled: panEnabled,
    speed: panSpeed,
    wake,
    initial: DEFAULT_ANGLE,
  })
  // Seconds on the drift clock; see `Frame.driftTime`.
  const driftClock = useRef(0)
  // When the guide line starts fading: Infinity while the line is being
  // dragged, release time + hold after, 0 when it's never been shown.
  const guideUntil = useRef(0)

  // The GL context lives as long as the canvas. Picture, settings and theme
  // all change without tearing it down.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // createField throws if the driver rejects the shaders; treat that like
    // no WebGL2 rather than letting it take down the page.
    let field: Field | null = null
    try {
      field = createField(canvas)
    } catch {
      field = null
    }
    if (!field) {
      setStatus({ kind: "unsupported" })
      return
    }
    fieldRef.current = field
    return () => {
      field.dispose()
      fieldRef.current = null
    }
  }, [])

  // Upload the picture into the field and restart the gather-in.
  useEffect(() => {
    if (!picture) return
    fieldRef.current?.setPicture(picture)
    introStart.current = performance.now()
  }, [picture])

  // The frame loop. Restarting it when a slider moves is free — time comes
  // from the clock, not a counter, so the motion carries on unbroken.
  useEffect(() => {
    const field = fieldRef.current
    if (!field || !picture) return
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      frame = 0
      const settling = pan.step()
      const guide = Math.min(
        1,
        Math.max(0, 1 - (now - guideUntil.current) / GUIDE_FADE_MS)
      )
      if (!reduce && last)
        driftClock.current += ((now - last) / 1000) * driftSpeed
      last = now

      const intro = reduce
        ? 1
        : Math.min(1, (now - introStart.current) / INTRO_MS)
      field.draw({
        time: reduce ? 0 : now / 1000,
        driftTime: driftClock.current,
        intro,
        settings,
        light,
        pan: pan.pan.current,
        guide,
      })
      if (!reduce || settling || guide > 0) {
        frame = requestAnimationFrame(tick)
      }
    }
    wake.current = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      wake.current = () => {}
    }
  }, [picture, settings, light, reduce, driftSpeed, stage.width])

  // Release the last object URL on unmount.
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    []
  )

  // Open with something on screen. A picture dropped in before this resolves
  // still wins, because it bumps `pickId`.
  useEffect(() => {
    const id = pickId.current
    loadDefaultPicture()
      .then((next) => {
        if (pickId.current !== id) return
        setPicture(next)
        setPictureUrl(DEFAULT_PICTURE)
      })
      .catch(() => setStatus({ kind: "error" }))
  }, [])

  const pickFile = async (file: File) => {
    const id = ++pickId.current
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    setStatus({ kind: "reading" })
    try {
      const image = await loadImage(url)
      const depth = await estimateDepth(url, (progress) => {
        if (pickId.current === id) {
          setStatus(
            progress < 1
              ? { kind: "downloading", progress }
              : { kind: "reading" }
          )
        }
      })
      if (pickId.current !== id) return
      setPicture({
        image,
        depth,
        aspect: image.naturalWidth / image.naturalHeight,
      })
      setPictureUrl(url)
      setPictureName(file.name)
      setStatus({ kind: "idle" })
    } catch {
      if (pickId.current === id) setStatus({ kind: "error" })
    }
  }

  const showGuide = (active: boolean) => {
    guideUntil.current = active ? Infinity : performance.now() + GUIDE_HOLD_MS
    wake.current()
  }

  // Hand over the depth map of whatever is on screen as the PNG the component
  // reads — so trying your own picture here is also how you get its map.
  const downloadDepth = async () => {
    if (!picture) return
    const blob = await depthToPng(picture.depth)
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = depthFileName(pictureName)
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 0)
  }

  const replay = () => {
    introStart.current = performance.now()
  }

  const onChange = (patch: Partial<DustSettings>) =>
    setSettings((s) => ({ ...s, ...patch }))

  // Turning panning off also puts the view back, so the switch is a reliable
  // way out of an angle you've dragged yourself into.
  const togglePan = (on: boolean) => {
    setPanEnabled(on)
    if (!on) pan.reset()
  }

  const stageHeight = stage.width
    ? Math.round(
        Math.min(MAX_STAGE_H, Math.max(MIN_STAGE_H, stage.width * STAGE_RATIO))
      )
    : MIN_STAGE_H

  const aspect = picture?.aspect ?? 16 / 9
  // The flat picture for Compare: the same size and place as the dust, so
  // flicking between them shows exactly what the depth adds.
  const flatSize = pictureSize(aspect, stage.width || 1, stageHeight)

  return {
    settings,
    comparing,
    setComparing,
    pictureUrl,
    pictureName,
    downloadDepth,
    flatSize,
    angle: pan.angle,
    status,
    stage,
    stageHeight,
    canvasRef,
    hasPicture: !!picture,
    aspect,
    busy: status.kind === "downloading" || status.kind === "reading",
    light,
    panEnabled,
    panSpeed,
    driftSpeed,
    dragging: pan.dragging,
    onChange,
    pickFile,
    replay,
    showGuide,
    togglePan,
    setPanSpeed,
    setDriftSpeed,
    onPointerDown: pan.onPointerDown,
    onPointerMove: pan.onPointerMove,
    endDrag: pan.endDrag,
  }
}
