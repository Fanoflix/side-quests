import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { useCharacterFlow } from "./useCharacterFlow"
import type { CharacterFlowOptions } from "./useCharacterFlow"

export type CharacterFlowProps = CharacterFlowOptions & {
  value: string
  className?: string
  style?: CSSProperties
}

export function CharacterFlow({
  value,
  className,
  style,
  ...options
}: CharacterFlowProps) {
  const ref = useCharacterFlow(value, options)
  return (
    <span
      ref={ref}
      style={style}
      className={cn("relative inline-flex whitespace-pre", className)}
    />
  )
}
