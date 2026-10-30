import { useEffect } from "react"
import { useNavigate, useRouterState } from "@tanstack/react-router"

import { findTool, questNumber, tools } from "./tools"

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  )
}

export function useToolNav() {
  // The page that's on screen, not the one being navigated to. The URL changes
  // the moment a link is clicked, but the next route's code is still loading,
  // so a layout keyed on the URL switched shells around the *old* page: the
  // quest you were leaving flashed full width in the landing page's layout,
  // and the other way round. `resolvedLocation` moves only once the new
  // route renders, so the shell and the content change together.
  const pathname = useRouterState({
    select: (s) => (s.resolvedLocation ?? s.location).pathname,
  })
  const current = findTool(pathname)
  const index = current ? tools.indexOf(current) : -1
  const prev = index > 0 ? tools[index - 1] : tools.at(-1)
  const next = index >= 0 ? tools[(index + 1) % tools.length] : tools[0]

  return {
    current,
    number: current ? questNumber(current) : null,
    total: String(tools.length).padStart(2, "0"),
    prev: current ? prev : undefined,
    next: current ? next : undefined,
  }
}

export function useToolShortcuts() {
  const navigate = useNavigate()
  const { current, prev, next } = useToolNav()

  useEffect(() => {
    if (!current) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return
      if (event.key === "]" && next) navigate({ to: next.to })
      else if (event.key === "[" && prev) navigate({ to: prev.to })
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [current, next, prev, navigate])
}
