import { useLayoutEffect, useMemo, useRef } from "react"
import type { Easing } from "motion/react"
import { useReducedMotion } from "motion/react"

import { numberFlowEase, toCssEasing } from "../eases"
import { FlowEngine } from "./engine"
import type { FlowTiming, Trend } from "./engine"

export type CharacterFlowOptions = {
  duration?: number
  ease?: Easing
  slideDuration?: number
  slideEase?: Easing
  fadeDuration?: number
  fadeEase?: Easing
  stagger?: number
  trend?: Trend
  maxSteps?: number
  animated?: boolean
  respectMotionPreference?: boolean
}

export function useCharacterFlow(
  value: string,
  {
    duration = 0.9,
    ease = numberFlowEase,
    slideDuration = duration,
    slideEase = ease,
    fadeDuration = 0.45,
    fadeEase = "easeOut",
    stagger = 0,
    trend = "auto",
    maxSteps = 8,
    animated = true,
    respectMotionPreference = true,
  }: CharacterFlowOptions
) {
  const ref = useRef<HTMLSpanElement>(null)
  const engineRef = useRef<FlowEngine | null>(null)
  const reduce = useReducedMotion()

  const timing = useMemo<FlowTiming>(
    () => ({
      duration: duration * 1000,
      easing: toCssEasing(ease),
      slideDuration: slideDuration * 1000,
      slideEasing: toCssEasing(slideEase),
      fadeDuration: fadeDuration * 1000,
      fadeEasing: fadeEase === "easeOut" ? "ease-out" : toCssEasing(fadeEase),
      stagger: stagger * 1000,
      trend,
      maxSteps,
      animate: animated && !(respectMotionPreference && reduce),
    }),
    [
      duration,
      ease,
      slideDuration,
      slideEase,
      fadeDuration,
      fadeEase,
      stagger,
      trend,
      maxSteps,
      animated,
      respectMotionPreference,
      reduce,
    ]
  )

  useLayoutEffect(() => {
    if (!ref.current) return
    const engine = new FlowEngine(ref.current)
    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    engineRef.current?.update(value, timing)
  }, [value, timing])

  return ref
}
