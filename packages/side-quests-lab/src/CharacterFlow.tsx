import type { CSSProperties } from "react"

import { useCharacterFlow } from "../../../src/features/motion/character-flow/useCharacterFlow"
import type { CharacterFlowOptions } from "../../../src/features/motion/character-flow/useCharacterFlow"

export type { CharacterFlowOptions }

export type CharacterFlowProps = CharacterFlowOptions & {
  /** The text to show. Change it and the letters roll and slide to the new one. */
  value: string
  className?: string
  style?: CSSProperties
}

/**
 * NumberFlow, but for words: change `value` and each letter spins through the
 * alphabet to its new one, while letters both words share slide to their new
 * spot. Inherits font, size and colour from its parent.
 */
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
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        whiteSpace: "pre",
        ...style,
      }}
    />
  )
}
