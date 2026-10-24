import { Moon, Sun } from "lucide-react"

import { useThemeToggle } from "./useThemeToggle"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeToggle()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className={className}
    >
      {theme === "dark" ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </button>
  )
}
