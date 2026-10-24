import { useCallback, useEffect, useMemo, useState } from "react"
import type { KeyboardEvent } from "react"
import { useNavigate } from "@tanstack/react-router"

import { bindShortcutRelease, isSearchShortcut } from "./shortcut"
import { tools } from "./tools"
import type { Tool } from "./tools"

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let i = 0
  for (let j = 0; j < t.length && i < q.length; j++) {
    if (t[j] === q[i]) i++
  }
  return i === q.length
}

export function matchTools(query: string): Tool[] {
  const q = query.trim()
  if (!q) return tools
  return tools.filter((tool) =>
    [tool.title, tool.category, ...tool.keywords].some((text) =>
      fuzzyMatch(q, text)
    )
  )
}

export function useQuestMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQueryState] = useState("")
  const [active, setActive] = useState(0)

  const results = useMemo(() => matchTools(query), [query])
  const activeIndex = Math.min(active, Math.max(0, results.length - 1))

  useEffect(
    () => bindShortcutRelease(isSearchShortcut, () => setOpen((o) => !o)),
    []
  )

  const show = useCallback(() => setOpen(true), [])

  const setQuery = (value: string) => {
    setQueryState(value)
    setActive(0)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery("")
  }

  const choose = (tool: Tool) => {
    onOpenChange(false)
    navigate({ to: tool.to })
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((activeIndex + 1) % Math.max(1, results.length))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive(
        (activeIndex - 1 + results.length) % Math.max(1, results.length)
      )
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault()
      choose(results[activeIndex])
    }
  }

  return {
    show,
    open,
    onOpenChange,
    query,
    setQuery,
    results,
    activeIndex,
    setActive,
    choose,
    onInputKeyDown,
  }
}
