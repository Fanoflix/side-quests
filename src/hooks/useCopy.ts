import { useEffect, useRef, useState } from "react"

const COPIED_MS = 1600

/**
 * Copy text to the clipboard and remember which thing was copied for a
 * moment, so its button can say "Copied". `key` tells several copy buttons
 * on one card apart; a new copy replaces the old one's moment.
 */
export function useCopy<TKey extends string>() {
  const [copied, setCopied] = useState<TKey | null>(null)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = (key: TKey, text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(key)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(null), COPIED_MS)
      })
      .catch(() => setCopied(null))
  }

  return { copied, copy }
}
