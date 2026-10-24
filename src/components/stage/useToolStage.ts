import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useRail } from "./railContext"

export const RAIL_QUERY = "(min-width: 1280px)"

export function useToolStage() {
  const hasRailSpace = useMediaQuery(RAIL_QUERY)
  const rail = useRail()
  const [sheetOpen, setSheetOpen] = useState(false)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return {
    rail: hasRailSpace ? rail : null,
    sheetOpen,
    setSheetOpen,
    surfaceRef,
    width,
  }
}

export type ToolStageState = ReturnType<typeof useToolStage>
