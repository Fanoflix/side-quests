import { useEffect, useRef, useState } from "react"

import { createField } from "@/features/canvas-stuff/depth-dust/field"
import { DEFAULT_SETTINGS } from "@/features/canvas-stuff/depth-dust/defaults"
import { loadDefaultPicture } from "@/features/canvas-stuff/depth-dust/useDepthDust"

export function useFrozenRoll(from: string, to: string, progress: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(from)

  useEffect(() => {
    let frame = 0
    let cancelled = false
    if (value === from) {
      document.fonts.ready.then(() => {
        if (!cancelled) frame = requestAnimationFrame(() => setValue(to))
      })
    } else {
      frame = requestAnimationFrame(() => {
        const rolling = ref.current?.getAnimations({ subtree: true }) ?? []
        for (const animation of rolling) {
          const end = Number(animation.effect?.getComputedTiming().endTime ?? 0)
          animation.pause()
          animation.currentTime = end * progress
          animation.commitStyles()
          animation.cancel()
        }
      })
    }
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [value, from, to, progress])

  return { ref, value }
}

const HERO_SETTINGS = { ...DEFAULT_SETTINGS, splash: 0.25 }
const HERO_ANGLE = { yaw: 0.42, pitch: 0.06 }
const HERO_DRIFT_TIME = 30

export function useDepthDustHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const field = createField(canvas)
    if (!field) return
    let frame = 0
    let cancelled = false
    loadDefaultPicture()
      .then((picture) => {
        if (cancelled) return
        field.setPicture(picture)
        const draw = () => {
          field.draw({
            time: 0,
            driftTime: HERO_DRIFT_TIME,
            intro: 1,
            settings: HERO_SETTINGS,
            light: false,
            pan: HERO_ANGLE,
            guide: 0,
          })
          frame = requestAnimationFrame(draw)
        }
        draw()
      })
      .catch(() => {})
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      field.dispose()
    }
  }, [])

  return { canvasRef }
}
