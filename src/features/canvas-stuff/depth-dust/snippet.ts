import {
  DEFAULT_ANGLE,
  DEFAULT_DRIFT_SPEED,
  DEFAULT_PAN_SPEED,
  DEFAULT_SETTINGS,
} from "./defaults"
import type { DriftLine, DustSettings } from "./field"
import type { Pan } from "./usePan"

export const PACKAGE_NAME = "side-quests-lab"
export const INSTALL = `npm i ${PACKAGE_NAME} motion`

/** The component's own defaults, so the snippet only lists what you changed. */
const DEFAULTS = {
  ...DEFAULT_SETTINGS,
  driftSpeed: DEFAULT_DRIFT_SPEED,
  panSpeed: DEFAULT_PAN_SPEED,
}

/**
 * The depth map's file name for a picture: its name without the extension,
 * plus `-depth.png`. The download and the snippet both use it, so the file
 * you save is the file the snippet asks for.
 */
export function depthFileName(pictureName: string) {
  const stem = pictureName.replace(/\.[^./]+$/, "") || "picture"
  return `${stem}-depth.png`
}

export type SnippetInput = DustSettings & {
  /** The picture's file name, e.g. `helm.jpg`. */
  pictureName: string
  driftSpeed: number
  light: boolean
  pan: boolean
  panSpeed: number
  /** Where the view rests, after any drag. */
  angle: Pan
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
    `src="/${input.pictureName}"`,
    `depthMap="/${depthFileName(input.pictureName)}"`,
  ]
  for (const key of ["drift", "splash", "cohesion", "depth"] as const) {
    if (round(input[key]) !== round(DEFAULTS[key])) {
      props.push(`${key}={${round(input[key])}}`)
    }
  }
  if (!sameLine(input.line, DEFAULTS.line)) {
    props.push(
      `line={{ a: ${point(input.line.a)}, b: ${point(input.line.b)} }}`
    )
  }
  if (input.particles !== DEFAULTS.particles) {
    props.push(`particles="${input.particles}"`)
  }
  for (const key of ["driftSpeed", "reach", "spread", "softness"] as const) {
    if (round(input[key]) !== round(DEFAULTS[key])) {
      props.push(`${key}={${round(input[key])}}`)
    }
  }
  if (input.light) props.push(`theme="light"`)
  if (!input.pan) props.push(`pan={false}`)
  else if (round(input.panSpeed) !== DEFAULTS.panSpeed) {
    props.push(`panSpeed={${round(input.panSpeed)}}`)
  }
  if (
    round(input.angle.yaw) !== DEFAULT_ANGLE.yaw ||
    round(input.angle.pitch) !== DEFAULT_ANGLE.pitch
  ) {
    props.push(
      `angle={{ yaw: ${round(input.angle.yaw)}, pitch: ${round(input.angle.pitch)} }}`
    )
  }

  return [
    `import { DepthDust } from "${PACKAGE_NAME}"`,
    "",
    "<DepthDust",
    ...props.map((p) => `  ${p}`),
    "/>",
  ].join("\n")
}
