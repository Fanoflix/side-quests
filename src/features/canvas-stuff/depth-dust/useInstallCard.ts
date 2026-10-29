import { useEffect, useRef, useState } from "react"

import { INSTALL, depthDustSnippet } from "./snippet"
import type { SnippetInput } from "./snippet"

const COPIED_MS = 1600

type Copied = "install" | "snippet" | null

/**
 * The "use it in your app" card: the install line and a snippet of the
 * component as currently tuned, each with a copy button that says "Copied"
 * for a moment after it works.
 */
export function useInstallCard(input: SnippetInput) {
  const [copied, setCopied] = useState<Copied>(null)
  const timer = useRef(0)
  const snippet = depthDustSnippet(input)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = (which: Exclude<Copied, null>) => {
    navigator.clipboard
      .writeText(which === "install" ? INSTALL : snippet)
      .then(() => {
        setCopied(which)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(null), COPIED_MS)
      })
      .catch(() => setCopied(null))
  }

  return { install: INSTALL, snippet, copied, copy }
}
