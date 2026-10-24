import { useSyncExternalStore } from "react"

export function useDevicePixelRatio() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange)
      return () => window.removeEventListener("resize", onChange)
    },
    () => window.devicePixelRatio || 1,
    () => 1
  )
}
