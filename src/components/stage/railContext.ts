import { createContext, use } from "react"

export const RailContext = createContext<HTMLElement | null>(null)

export function useRail() {
  return use(RailContext)
}
