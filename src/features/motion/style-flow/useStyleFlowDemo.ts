import { useCallback, useEffect, useRef, useState } from "react"
import { useSearch } from "@tanstack/react-router"

import { useToolStage } from "@/components/stage/useToolStage"

import type { EaseKey } from "../eases"
import { DEFAULT_EASE_KEY, resolveEase } from "../eases"
import type { TrackName, TrackPick } from "./useStyleFlow"
import { ALL_TRACKS } from "./useStyleFlow"

/** Sample strings to shuffle through. */
export const SAMPLES = [
  "Typeface",
  "Variable",
  "Fraunces",
  "Recursive",
  "Shimmer",
]

/** Human labels for each track toggle. */
export const TRACK_LABELS: Record<TrackName, string> = {
  weight: "Weight",
  slant: "Italic",
  family: "Serif",
  size: "Size",
}

/** Cooldown values offered in the demo. */
export const COOLDOWNS = [1, 2, 3]

/** Track-order strategies offered in the demo. */
export const PICKS: { key: TrackPick; label: string }[] = [
  { key: "random", label: "Random" },
  { key: "roundRobin", label: "Round-robin" },
]

/** The initial value of every piece of demo state, fully typed. */
export type StyleFlowDefaults = {
  value: string
  seed: number
  cooldown: number
  /** Total run length (s). */
  duration: number
  /** Seconds between the start of a character's consecutive turns. */
  stepInterval: number
  /** Seconds a single track transition takes. */
  stepDuration: number
  trackPick: TrackPick
  easeKey: EaseKey
  looping: boolean
  active: Record<TrackName, boolean>
}

/** Every default in one place. */
export const STYLE_FLOW_DEFAULTS: StyleFlowDefaults = {
  value: SAMPLES[0],
  seed: 1,
  cooldown: 1,
  duration: 6,
  stepInterval: 0.13,
  stepDuration: 0.04,
  trackPick: "random",
  easeKey: DEFAULT_EASE_KEY,
  looping: true,
  active: { weight: true, slant: true, family: true, size: true },
}

export type PresetKey = "shimmer" | "breathing" | "ransom" | "wave"

type Preset = {
  key: PresetKey
  label: string
  tracks: TrackName[]
  cooldown: number
  trackPick: TrackPick
  easeKey: EaseKey
  stepInterval: number
  stepDuration: number
}

export const PRESETS: Preset[] = [
  {
    key: "shimmer",
    label: "Shimmer",
    tracks: ["weight", "slant", "family", "size"],
    cooldown: 1,
    trackPick: "random",
    easeKey: DEFAULT_EASE_KEY,
    stepInterval: 0.13,
    stepDuration: 0.04,
  },
  {
    key: "breathing",
    label: "Breathing",
    tracks: ["weight"],
    cooldown: 1,
    trackPick: "roundRobin",
    easeKey: "smooth",
    stepInterval: 0.45,
    stepDuration: 0.4,
  },
  {
    key: "ransom",
    label: "Ransom note",
    tracks: ["weight", "slant", "family", "size"],
    cooldown: 1,
    trackPick: "random",
    easeKey: "expoOut",
    stepInterval: 0.07,
    stepDuration: 0.02,
  },
  {
    key: "wave",
    label: "Wave",
    tracks: ["weight", "size"],
    cooldown: 1,
    trackPick: "roundRobin",
    easeKey: "springy",
    stepInterval: 0.2,
    stepDuration: 0.18,
  },
]

const COPIED_MS = 1600

function fitSize(text: string) {
  const length = Math.max(4, Array.from(text).length)
  return Math.round(Math.min(96, Math.max(36, 760 / length)))
}

export function useStyleFlowDemo() {
  const search = useSearch({ from: "/style-flow" })
  const [value, setValue] = useState(search.text ?? STYLE_FLOW_DEFAULTS.value)
  const [preset, setPreset] = useState<PresetKey | null>("shimmer")
  const [copied, setCopied] = useState(false)
  const stage = useToolStage()
  const [, setSampleIndex] = useState(0)
  const [seed, setSeed] = useState(STYLE_FLOW_DEFAULTS.seed)
  const [playToken, setPlayToken] = useState(0)
  const [cooldown, setCooldown] = useState(STYLE_FLOW_DEFAULTS.cooldown)
  const [duration, setDuration] = useState(STYLE_FLOW_DEFAULTS.duration)
  const [stepInterval, setStepInterval] = useState(
    STYLE_FLOW_DEFAULTS.stepInterval
  )
  const [stepDuration, setStepDuration] = useState(
    STYLE_FLOW_DEFAULTS.stepDuration
  )
  const [trackPick, setTrackPick] = useState<TrackPick>(
    STYLE_FLOW_DEFAULTS.trackPick
  )
  const [easeKey, setEaseKey] = useState<EaseKey>(STYLE_FLOW_DEFAULTS.easeKey)
  const [looping, setLooping] = useState(STYLE_FLOW_DEFAULTS.looping)
  const [active, setActive] = useState<Record<TrackName, boolean>>(
    STYLE_FLOW_DEFAULTS.active
  )

  const tracks = ALL_TRACKS.filter((t) => active[t])
  const ease = resolveEase(easeKey)

  /** Re-run from the top with a fresh random shimmer. */
  const replay = useCallback(() => {
    setSeed((s) => (s + 0x9e37 + 1) >>> 0)
    setPlayToken((t) => t + 1)
  }, [])

  /** Advance to the next sample word and re-run. */
  const nextSample = useCallback(() => {
    setSampleIndex((i) => {
      const next = (i + 1) % SAMPLES.length
      setValue(SAMPLES[next])
      return next
    })
    replay()
  }, [replay])

  const toggleTrack = (track: TrackName) =>
    setActive((prev) => {
      const next = { ...prev, [track]: !prev[track] }
      // Never leave the shimmer with nothing to animate.
      if (ALL_TRACKS.every((t) => !next[t])) return prev
      return next
    })

  // Loop the finite run for the showcase (the component itself never loops).
  // Re-arms whenever the run length changes so the cadence stays in step.
  const replayRef = useRef(replay)
  replayRef.current = replay
  useEffect(() => {
    if (!looping) return
    const id = setInterval(() => replayRef.current(), duration * 1000)
    return () => clearInterval(id)
  }, [looping, duration])

  const applyPreset = (key: PresetKey) => {
    const next = PRESETS.find((p) => p.key === key)
    if (!next) return
    setPreset(key)
    setActive({
      weight: next.tracks.includes("weight"),
      slant: next.tracks.includes("slant"),
      family: next.tracks.includes("family"),
      size: next.tracks.includes("size"),
    })
    setCooldown(next.cooldown)
    setTrackPick(next.trackPick)
    setEaseKey(next.easeKey)
    setStepInterval(next.stepInterval)
    setStepDuration(next.stepDuration)
    replay()
  }

  const copyLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("text", value)
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), COPIED_MS)
      })
      .catch(() => setCopied(false))
  }

  const size = fitSize(value)

  const custom =
    <T>(set: (next: T) => void) =>
    (next: T) => {
      setPreset(null)
      set(next)
    }

  return {
    stage,
    value,
    setValue,
    preset,
    applyPreset,
    copied,
    copyLink,
    size,
    seed,
    playToken,
    cooldown,
    setCooldown: custom(setCooldown),
    duration,
    setDuration,
    stepInterval,
    setStepInterval: custom(setStepInterval),
    stepDuration,
    setStepDuration: custom(setStepDuration),
    trackPick,
    setTrackPick: custom(setTrackPick),
    easeKey,
    setEaseKey: custom(setEaseKey),
    ease,
    looping,
    setLooping,
    active,
    toggleTrack: custom(toggleTrack),
    tracks,
    replay,
    nextSample,
  }
}
