import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { dither } from "@/features/canvas-stuff/dithering/pipeline"
import { render } from "@/features/canvas-stuff/anti-aliasing/raster"
import {
  DEFAULT_LINE,
  createField,
} from "@/features/canvas-stuff/depth-dust/field"
import { loadDefaultPicture } from "@/features/canvas-stuff/depth-dust/useDepthDust"
import { useInView } from "@/hooks/useInView"

export const DITHER_IMAGE = `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/dither-default.jpg`

const DITHER_WIDTH = 220

export function useDitherPreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawn = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!inView || drawn.current || !canvas) return
    drawn.current = true
    const image = new Image()
    image.onload = () => {
      const w = DITHER_WIDTH
      const h = Math.round((image.naturalHeight / image.naturalWidth) * w)
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(image, 0, 0, w, h)
      const source = ctx.getImageData(0, 0, w, h)
      const out = dither(source, {
        algorithm: "atkinson",
        colorMode: "grayscale",
        levels: 2,
        pixelScale: 1,
        contrast: 15,
        invert: false,
      })
      ctx.putImageData(new ImageData(new Uint8ClampedArray(out), w, h), 0, 0)
    }
    image.src = DITHER_IMAGE
  }, [inView])

  return { ref, inView, canvasRef }
}

const AA_W = 112
const AA_H = 63

export function useAntiAliasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    canvas.width = AA_W
    canvas.height = AA_H
    const scene = {
      scene: "sphere",
      angle: 24,
      size: 0.82,
      resolution: AA_W,
    } as const
    const jagged = render(AA_W, AA_H, { ...scene, samples: 1 }).data
    const smooth = render(AA_W, AA_H, { ...scene, samples: 6 }).data
    const mixed = new Uint8ClampedArray(jagged.length)
    for (let i = 0; i < mixed.length; i += 4) {
      const x = (i / 4) % AA_W
      const from = x < AA_W / 2 ? jagged : smooth
      mixed.set(from.subarray(i, i + 4), i)
    }
    ctx.putImageData(new ImageData(mixed, AA_W, AA_H), 0, 0)
  }, [])

  return { canvasRef }
}

const DOT_COLS = 32
const DOT_ROWS = 18
const FRAME_MS = 1000 / 30

function plasma(x: number, y: number, t: number) {
  const v =
    Math.sin(x * 0.32 + t) +
    Math.sin(y * 0.41 - t * 1.3) +
    Math.sin((x + y) * 0.22 + t * 0.7) +
    Math.sin(Math.hypot(x - 16, y - 9) * 0.45 - t * 1.6)
  return (v + 4) / 8
}

export function useLowResPreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !inView) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cell = Math.max(4, Math.floor((canvas.clientWidth * dpr) / DOT_COLS))
    canvas.width = cell * DOT_COLS
    canvas.height = cell * DOT_ROWS
    const radius = cell * 0.36

    let frame = 0
    let last = 0
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (now - last < FRAME_MS) return
      last = now
      const t = reduce ? 1.2 : now / 900
      ctx.fillStyle = "#050607"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < DOT_ROWS; y++) {
        for (let x = 0; x < DOT_COLS; x++) {
          const v = plasma(x, y, t)
          const lit = v * v
          ctx.fillStyle = `oklch(${0.3 + lit * 0.65} ${0.04 + lit * 0.09} ${186 - lit * 60})`
          ctx.beginPath()
          ctx.arc((x + 0.5) * cell, (y + 0.5) * cell, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (reduce) cancelAnimationFrame(frame)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduce])

  return { ref, canvasRef }
}

const DUST_POINTS = 65_536

export function useDepthDustPreview() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const field = createField(canvas, DUST_POINTS)
    if (!field) return
    let frame = 0
    let cancelled = false
    loadDefaultPicture()
      .then((picture) => {
        if (cancelled) return
        field.setPicture(picture)
        const draw = (now: number) => {
          field.draw({
            time: reduce ? 0 : now / 1000,
            driftTime: reduce ? 0 : now / 1000,
            intro: 1,
            settings: {
              drift: 0.9,
              splash: 0.2,
              gather: 0.9,
              depth: 0.45,
              line: DEFAULT_LINE,
              particles: "subtle",
              spread: 0.5,
              reach: 1,
              softness: 0.5,
            },
            light: false,
            pan: { yaw: 0, pitch: 0 },
            guide: 0,
          })
          if (!reduce) frame = requestAnimationFrame(draw)
        }
        frame = requestAnimationFrame(draw)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      field.dispose()
    }
  }, [inView, reduce])

  return { ref, canvasRef }
}
