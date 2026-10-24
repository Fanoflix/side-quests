import { useEffect, useState } from "react"

import { applyTheme, getStoredTheme } from "./theme"
import type { Theme } from "./theme"

export function useThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    setTheme(getStoredTheme())
  }, [])

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    applyTheme(next)
    setTheme(next)
  }

  return { theme, toggle }
}
