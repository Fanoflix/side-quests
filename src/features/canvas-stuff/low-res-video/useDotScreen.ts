import { useCallback, useEffect, useRef } from "react"
import type { RefObject } from "react"

import { coverCrop, drawDotTile } from "./screen"
import type { Grid, Look, ScreenLayout } from "./screen"

const SCREEN_OFF = "#16181a"

type Scene = { grid: Grid; look: Look; layout: ScreenLayout }

export function useDotScreen(
  videoRef: RefObject<HTMLVideoElement | null>,
  scene: Scene
) {
  const dotsRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef(scene)
  sceneRef.current = scene
  const tileRef = useRef<{ key: string; pattern: CanvasPattern } | null>(null)

  const patternFor = useCallback(
    (ctx: CanvasRenderingContext2D, cell: number, look: Look) => {
      const key = `${cell}:${look.shape}:${look.fill}`
      if (tileRef.current?.key === key) return tileRef.current.pattern
      const tile = document.createElement("canvas")
      tile.width = cell
      tile.height = cell
      const tctx = tile.getContext("2d")
      if (!tctx) return null
      drawDotTile(tctx, cell, look)
      const pattern = ctx.createPattern(tile, "repeat")
      if (!pattern) return null
      tileRef.current = { key, pattern }
      return pattern
    },
    []
  )

  const draw = useCallback(() => {
    const dots = dotsRef.current
    const glow = glowRef.current
    if (!dots || !glow) return
    const { grid, look, layout } = sceneRef.current

    if (glow.width !== grid.cols) glow.width = grid.cols
    if (glow.height !== grid.rows) glow.height = grid.rows
    const gctx = glow.getContext("2d")
    if (!gctx) return
    const video = videoRef.current
    if (video && video.readyState >= 2 && video.videoWidth) {
      const [sx, sy, sw, sh] = coverCrop(
        video.videoWidth,
        video.videoHeight,
        grid
      )
      gctx.imageSmoothingEnabled = true
      gctx.imageSmoothingQuality = "high"
      gctx.drawImage(video, sx, sy, sw, sh, 0, 0, grid.cols, grid.rows)
    } else {
      gctx.fillStyle = SCREEN_OFF
      gctx.fillRect(0, 0, grid.cols, grid.rows)
    }

    if (dots.width !== layout.backingW) dots.width = layout.backingW
    if (dots.height !== layout.backingH) dots.height = layout.backingH
    const ctx = dots.getContext("2d")
    if (!ctx) return
    ctx.globalCompositeOperation = "copy"
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(glow, 0, 0, layout.backingW, layout.backingH)
    const pattern = patternFor(ctx, layout.cell, look)
    if (pattern) {
      ctx.globalCompositeOperation = "destination-in"
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, layout.backingW, layout.backingH)
    }
    ctx.globalCompositeOperation = "source-over"
  }, [videoRef, patternFor])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let stopped = false
    let frame = 0
    const onSeeked = () => draw()
    video.addEventListener("seeked", onSeeked)
    video.addEventListener("loadeddata", onSeeked)

    if (typeof video.requestVideoFrameCallback === "function") {
      const loop = () => {
        draw()
        if (!stopped) frame = video.requestVideoFrameCallback(loop)
      }
      frame = video.requestVideoFrameCallback(loop)
      return () => {
        stopped = true
        video.cancelVideoFrameCallback(frame)
        video.removeEventListener("seeked", onSeeked)
        video.removeEventListener("loadeddata", onSeeked)
      }
    }

    const loop = () => {
      if (!video.paused && !video.ended) draw()
      if (!stopped) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      video.removeEventListener("seeked", onSeeked)
      video.removeEventListener("loadeddata", onSeeked)
    }
  }, [videoRef, draw])

  const { grid, look, layout } = scene
  useEffect(() => {
    draw()
  }, [
    draw,
    grid.cols,
    grid.rows,
    look.shape,
    look.fill,
    layout.cell,
    layout.backingW,
    layout.backingH,
  ])

  return { dotsRef, glowRef }
}
