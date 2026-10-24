import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

export function useCycle<T>(
  items: readonly T[],
  intervalMs: number,
  active = true
) {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!active || reduce || items.length < 2) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      intervalMs
    )
    return () => clearInterval(id)
  }, [active, reduce, items.length, intervalMs])

  return items[index % items.length]
}
