import { DEFAULT_LINE } from "./field"
import type { DriftLine, DustSettings } from "./field"

export const PACKAGE_NAME = "side-quests-lab"
export const INSTALL = `npm i ${PACKAGE_NAME} motion`

/** The component's own defaults, so the snippet only lists what you changed. */
const DEFAULTS = {
  drift: 0.9,
  splash: 0.15,
  gather: 0.95,
  depth: 0.2,
  particles: "subtle",
  driftSpeed: 1,
  spread: 0.5,
  reach: 1,
  softness: 0.5,
  theme: "dark",
  pan: true,
  panSpeed: 1,
} as const

export type SnippetInput = DustSettings & {
  driftSpeed: number
  light: boolean
  pan: boolean
  panSpeed: number
}

const round = (v: number) => Math.round(v * 100) / 100

const sameLine = (a: DriftLine, b: DriftLine) =>
  [a.a.x, a.a.y, a.b.x, a.b.y].every(
    (v, i) => round(v) === round([b.a.x, b.a.y, b.b.x, b.b.y][i])
  )

const point = ({ x, y }: { x: number; y: number }) =>
  `{ x: ${round(x)}, y: ${round(y)} }`

/**
 * The `<DepthDust />` you'd write to get what's on screen, listing only the
 * props that differ from the component's defaults — a snippet full of values
 * you never touched hides the two you did.
 */
export function depthDustSnippet(input: SnippetInput): string {
  const props: string[] = [
    `src="/your-picture.jpg"`,
    `depthMap="/its-depth.png"`,
  ]
  for (const key of ["drift", "splash", "gather", "depth"] as const) {
    if (round(input[key]) !== DEFAULTS[key]) {
      props.push(`${key}={${round(input[key])}}`)
    }
  }
  if (!sameLine(input.line, DEFAULT_LINE)) {
    props.push(
      `line={{ a: ${point(input.line.a)}, b: ${point(input.line.b)} }}`
    )
  }
  if (input.particles !== DEFAULTS.particles) {
    props.push(`particles="${input.particles}"`)
  }
  for (const key of ["driftSpeed", "reach", "spread", "softness"] as const) {
    if (round(input[key]) !== DEFAULTS[key]) {
      props.push(`${key}={${round(input[key])}}`)
    }
  }
  if (input.light) props.push(`theme="light"`)
  if (!input.pan) props.push(`pan={false}`)
  else if (round(input.panSpeed) !== DEFAULTS.panSpeed) {
    props.push(`panSpeed={${round(input.panSpeed)}}`)
  }

  return [
    `import { DepthDust } from "${PACKAGE_NAME}"`,
    "",
    "<DepthDust",
    ...props.map((p) => `  ${p}`),
    "/>",
  ].join("\n")
}
