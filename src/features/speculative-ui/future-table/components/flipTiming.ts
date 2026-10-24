import type { CharacterFlowOptions } from "@/features/motion/character-flow/useCharacterFlow"

const ROW_STEP = 0.045
const COLUMN_STEP = 0.03

export const FLIP: CharacterFlowOptions = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
  fadeDuration: 0.2,
  stagger: 0.018,
  maxSteps: 3,
  trend: "auto",
}

export function flipDelay(row: number, column: number) {
  return row * ROW_STEP + column * COLUMN_STEP
}
