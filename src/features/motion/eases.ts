import type { Easing } from "motion/react"
import { easingDefinitionToFunction, isBezierDefinition } from "motion/react"

/** Classic "bounce out" easing — settles with a couple of decaying hops. */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
  return n1 * (t -= 2.625 / d1) * t + 0.984375
}

/** Spring-like "elastic out" easing — overshoots, then wobbles into place. */
export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t
  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

function simulateSpring(stiffness: number, damping: number): number[] {
  const dt = 1 / 240
  const samples = [0]
  let x = 0
  let v = 0
  for (let t = 0; t < 4; t += dt) {
    v += (-stiffness * (x - 1) - damping * v) * dt
    x += v * dt
    samples.push(x)
    if (t > 0.2 && Math.abs(x - 1) < 0.0005 && Math.abs(v) < 0.005) break
  }
  samples[samples.length - 1] = 1
  return samples
}

function springEasing(stiffness: number, damping: number) {
  const samples = simulateSpring(stiffness, damping)
  const last = samples.length - 1
  return (t: number) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    const at = t * last
    const i = Math.floor(at)
    return samples[i] + (samples[i + 1] - samples[i]) * (at - i)
  }
}

export const springOut = springEasing(170, 17)

const NUMBER_FLOW_SAMPLES =
  "0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1"
    .split(",")
    .map(Number)

const NUMBER_FLOW_SETTLED = NUMBER_FLOW_SAMPLES[NUMBER_FLOW_SAMPLES.length - 2]

const NUMBER_FLOW_POINTS = NUMBER_FLOW_SAMPLES.map((v) =>
  Math.min(1, v / NUMBER_FLOW_SETTLED)
)

export const NUMBER_FLOW_CURVE = `linear(${NUMBER_FLOW_POINTS.map((v) => Number(v.toFixed(5))).join(",")})`

export function numberFlowEase(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const at = t * (NUMBER_FLOW_POINTS.length - 1)
  const i = Math.floor(at)
  const a = NUMBER_FLOW_POINTS[i]
  return a + (NUMBER_FLOW_POINTS[i + 1] - a) * (at - i)
}

/** The stable id of an easing preset — the union of every preset's `key`. */
export type EaseKey =
  | "numberFlow"
  | "spring"
  | "smooth"
  | "expoOut"
  | "expoInOut"
  | "springy"
  | "anticipate"
  | "elastic"
  | "bounce"

/** An easing preset for the demos: a stable key, a friendly label, an `Easing`. */
export type EasePreset = { key: EaseKey; label: string; value: Easing }

/**
 * Shared easing presets for the motion demos. Each `value` is a Motion `Easing`
 * — a cubic-bézier tuple, a built-in name, or a custom function. Overshoot
 * presets (Springy / Elastic / Bounce) pop past the target and settle back.
 */
export const EASES: readonly EasePreset[] = [
  { key: "numberFlow", label: "NumberFlow", value: numberFlowEase },
  { key: "spring", label: "Spring", value: springOut },
  { key: "smooth", label: "Smooth", value: [0.22, 1, 0.36, 1] },
  { key: "expoOut", label: "Expo Out", value: [0.16, 1, 0.3, 1] },
  { key: "expoInOut", label: "Expo In-Out", value: [0.87, 0, 0.13, 1] },
  { key: "springy", label: "Springy", value: [0.34, 1.56, 0.64, 1] },
  { key: "anticipate", label: "Anticipate", value: "anticipate" },
  { key: "elastic", label: "Elastic", value: easeOutElastic },
  { key: "bounce", label: "Bounce", value: easeOutBounce },
]

/** The default preset key (a smooth ease-out). */
export const DEFAULT_EASE_KEY: EaseKey = "smooth"

/** Resolve a preset key to its `Easing`, falling back to the first preset. */
export function resolveEase(key: EaseKey): Easing {
  return (EASES.find((e) => e.key === key) ?? EASES[0]).value
}

const LINEAR_SAMPLES = 48

export function toCssEasing(easing: Easing): string {
  if (easing === numberFlowEase) return NUMBER_FLOW_CURVE
  if (isBezierDefinition(easing)) return `cubic-bezier(${easing.join(", ")})`
  if (easing === "linear") return "linear"
  const fn =
    typeof easing === "function" ? easing : easingDefinitionToFunction(easing)
  const points: string[] = []
  for (let i = 0; i <= LINEAR_SAMPLES; i++) {
    points.push(fn(i / LINEAR_SAMPLES).toFixed(4))
  }
  return `linear(${points.join(", ")})`
}

export const SNAP = { duration: 0.175, ease: "circOut" } as const
