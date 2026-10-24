import { useEffect, useRef, useState } from "react"

import { useToolStage } from "@/components/stage/useToolStage"
import { useDevicePixelRatio } from "@/hooks/useDevicePixelRatio"
import { MAX_SCREEN_H, fitScreen, maxGrid, resolveGrid } from "./screen"
import type { DotShape, Grid, Look } from "./screen"
import { useDotScreen } from "./useDotScreen"

const DEFAULT_CLIP = `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/low-res-default.mp4`
const FALLBACK_AREA_W = 720
const STAGE_GUTTER = 48
const GLOW_BLUR = 0.9
const GLOW_OPACITY = 0.7

export type PresetKey = "scoreboard" | "led" | "litebrite" | "pixels"

export const PRESETS: {
  key: PresetKey
  label: string
  look: Look
  cols?: number
}[] = [
  {
    key: "scoreboard",
    label: "Scoreboard",
    look: { shape: "circle", fill: 0.78, glow: true },
  },
  {
    key: "led",
    label: "LED wall",
    look: { shape: "square", fill: 0.84, glow: true },
    cols: 96,
  },
  {
    key: "litebrite",
    label: "Lite-Brite",
    look: { shape: "circle", fill: 0.58, glow: true },
    cols: 40,
  },
  {
    key: "pixels",
    label: "Pixels",
    look: { shape: "square", fill: 1, glow: false },
  },
]

export const SHAPES: { value: DotShape; label: string }[] = [
  { value: "circle", label: "Round" },
  { value: "square", label: "Square" },
  { value: "diamond", label: "Diamond" },
]

export function useLowResVideo() {
  const stage = useToolStage()
  const dpr = useDevicePixelRatio()
  const [wanted, setWanted] = useState<Grid>({ cols: 64, rows: 36 })
  const [look, setLook] = useState<Look>(PRESETS[0].look)
  const [preset, setPreset] = useState<PresetKey | null>("scoreboard")
  const [lockToVideo, setLockToVideo] = useState(true)
  const [videoAspect, setVideoAspect] = useState(16 / 9)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolumeState] = useState(0.6)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const urlRef = useRef<string | null>(null)

  const areaW = stage.width ? stage.width - STAGE_GUTTER : FALLBACK_AREA_W
  const areaH = Math.min(MAX_SCREEN_H, Math.round(areaW / videoAspect))
  const max = maxGrid(areaW, areaH)
  const { grid, maxCols } = resolveGrid(wanted, lockToVideo, videoAspect, max)
  const layout = fitScreen(grid, areaW, areaH, dpr)

  const { dotsRef, glowRef } = useDotScreen(videoRef, { grid, look, layout })
  const screenStyle = { width: layout.cssW, height: layout.cssH }
  const glowStyle = {
    filter: `blur(${((layout.cell / dpr) * GLOW_BLUR).toFixed(1)}px) saturate(1.6)`,
    opacity: look.glow ? GLOW_OPACITY : 0,
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
    video.volume = volume
  }, [muted, volume])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setCurrentTime(video.currentTime)
    const onDuration = () => setDuration(video.duration || 0)
    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight)
      }
    }
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("timeupdate", onTime)
    video.addEventListener("durationchange", onDuration)
    video.addEventListener("loadedmetadata", onMeta)
    video.src = DEFAULT_CLIP
    void video.play().catch(() => {})
    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("timeupdate", onTime)
      video.removeEventListener("durationchange", onDuration)
      video.removeEventListener("loadedmetadata", onMeta)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const pickFile = (file: File) => {
    const video = videoRef.current
    if (!video) return
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = URL.createObjectURL(file)
    video.src = urlRef.current
    setCurrentTime(0)
    void video.play().catch(() => {})
  }

  const setCols = (cols: number) => setWanted({ ...grid, cols })
  const setRows = (rows: number) => setWanted({ ...grid, rows })

  const updateLook = (patch: Partial<Look>) => {
    setPreset(null)
    setLook((prev) => ({ ...prev, ...patch }))
  }

  const applyPreset = (key: PresetKey) => {
    const next = PRESETS.find((p) => p.key === key)
    if (!next) return
    setPreset(key)
    setLook(next.look)
    if (next.cols) setWanted({ ...grid, cols: next.cols })
  }

  const toggleLock = () => {
    setWanted(grid)
    setLockToVideo((locked) => !locked)
  }

  const seek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }

  const toggleMute = () => setMuted((m) => !m)

  const setVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next))
    setVolumeState(clamped)
    setMuted(clamped === 0)
  }

  return {
    stage,
    grid,
    limits: { maxCols, maxRows: max.rows },
    screenStyle,
    glowStyle,
    look,
    preset,
    lockToVideo,
    playing,
    muted,
    volume,
    currentTime,
    duration,
    videoRef,
    dotsRef,
    glowRef,
    setCols,
    setRows,
    updateLook,
    applyPreset,
    toggleLock,
    pickFile,
    seek,
    togglePlay,
    toggleMute,
    setVolume,
  }
}
