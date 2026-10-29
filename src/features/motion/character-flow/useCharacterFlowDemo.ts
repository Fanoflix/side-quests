import { useState } from "react"
import type { KeyboardEvent } from "react"

import { useToolStage } from "@/components/stage/useToolStage"
import { EASES, resolveEase } from "../eases"
import type { EaseKey } from "../eases"
import { graphemes } from "./engine"
import type { Trend } from "./engine"

export const BASE_WORDS = [
  "departures",
  "delayed",
  "boarding",
  "broadway",
  "Crossways",
  "Wayward",
  "StormPeaks",
  "now",
  "The Lich King",
]

export const SAMPLES = {
  hello: [
    "Hello",
    "Bonjour",
    "Hola",
    "Ciao",
    "Hallo",
    "Olá",
    "Merhaba",
    "Salaam",
  ],
  ui: ["Copy", "Copied", "Save", "Saving…", "Saved", "Follow", "Following"],
  sentences: [
    "the quick brown fox jumps over the lazy dog",
    "the lazy dog sleeps under the quick brown fox",
    "she sells sea shells by the sea shore",
    "we sailed past the shore into the open sea",
    "a journey of a thousand miles begins with one step",
    "all that glitters is not gold my friend",
  ],
  price: ["$1,024", "$980", "$12,300", "$47", "$8,675", "$309"],
} as const

export type Mode = "words" | keyof typeof SAMPLES

export const MODES: { key: Mode; label: string }[] = [
  { key: "words", label: "Words" },
  { key: "hello", label: "Hello" },
  { key: "ui", label: "UI labels" },
  { key: "sentences", label: "Sentences" },
  { key: "price", label: "Price" },
]

const BASE_SIZE_REM = { words: 4.5, sentences: 1.75 } as const
const GLYPH_WIDTH_EM = 0.58

export const PACKAGE_TAGLINES = [
  "Coming soon to npm",
  "One component for React",
  "NumberFlow's own curve",
  "Any word, not just numbers",
]

export type Timing = {
  duration: number
  easeKey: EaseKey
  slideDuration: number
  fadeDuration: number
  stagger: number
  maxSteps: number
  trend: Trend
}

export const DEFAULT_TIMING: Timing = {
  duration: 0.5,
  easeKey: "numberFlow",
  slideDuration: 0.5,
  fadeDuration: 0.5,
  stagger: 0,
  maxSteps: 6,
  trend: "auto",
}

export const TRENDS: { value: Trend; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
]

export function useCharacterFlowDemo() {
  const [mode, setMode] = useState<Mode>("words")
  const [words, setWords] = useState<string[]>(BASE_WORDS)
  const [indexes, setIndexes] = useState<Record<Mode, number>>({
    words: 0,
    hello: 0,
    ui: 0,
    sentences: 0,
    price: 0,
  })
  const [value, setValue] = useState<string>(BASE_WORDS[0])
  const [draft, setDraft] = useState("")
  const [timing, setTiming] = useState<Timing>(DEFAULT_TIMING)
  const stage = useToolStage()

  const updateTiming = (patch: Partial<Timing>) =>
    setTiming((prev) => ({ ...prev, ...patch }))
  const resetTiming = () => setTiming(DEFAULT_TIMING)
  const isDefaultTiming = (Object.keys(timing) as (keyof Timing)[]).every(
    (key) => timing[key] === DEFAULT_TIMING[key]
  )
  const listFor = (key: Mode): readonly string[] =>
    key === "words" ? words : SAMPLES[key]

  const goTo = (key: Mode, index: number) => {
    setIndexes((prev) => ({ ...prev, [key]: index }))
    setValue(listFor(key)[index])
  }

  const advance = () => {
    const list = listFor(mode)
    goTo(mode, (indexes[mode] + 1) % list.length)
  }

  const onPreviewKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    advance()
  }

  const selectMode = (next: Mode) => {
    setMode(next)
    setValue(listFor(next)[indexes[next]])
  }

  const selectWord = (index: number) => goTo("words", index)

  const addWord = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    const next = [...words, trimmed]
    setWords(next)
    setDraft("")
    setIndexes((prev) => ({ ...prev, words: next.length - 1 }))
    setValue(trimmed)
  }

  const removeWord = (index: number) => {
    if (words.length <= 1) return
    const next = words.filter((_, i) => i !== index)
    const current = indexes.words
    const clamped = Math.min(
      index < current ? current - 1 : current,
      next.length - 1
    )
    setWords(next)
    setIndexes((prev) => ({ ...prev, words: clamped }))
    setValue(next[clamped])
  }

  const isSentence = mode === "sentences"
  const base = isSentence ? BASE_SIZE_REM.sentences : BASE_SIZE_REM.words
  const length = Math.max(1, graphemes(value).length)
  const fontSize = `min(${base}rem, calc(100cqi / ${(length * GLYPH_WIDTH_EM).toFixed(2)}))`

  return {
    stage,
    timing,
    updateTiming,
    resetTiming,
    isDefaultTiming,
    eases: EASES,
    value,
    setValue,
    mode,
    selectMode,
    words,
    wordIndex: indexes.words,
    advance,
    onPreviewKey,
    selectWord,
    draft,
    setDraft,
    addWord,
    removeWord,
    ease: resolveEase(timing.easeKey),
    isSentence,
    fontSize,
  }
}
