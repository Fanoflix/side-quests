import { DEFAULT_LINE } from "./field"
import type { DustSettings } from "./field"
import type { Pan } from "./usePan"

/**
 * The look Depth Dust opens with, tuned by eye on the helm: a still, deep
 * picture facing you, with comets lifting gently off its
 * upper right. One source for the tool page, the published component's prop
 * defaults and the copy-paste snippet (which lists only what differs from
 * these), so the three can't drift apart.
 */
export const DEFAULT_SETTINGS: DustSettings = {
  drift: 0.72,
  splash: 0.15,
  cohesion: 0.95,
  depth: 0.84,
  line: DEFAULT_LINE,
  particles: "comets",
  spread: 0.25,
  reach: 0.25,
  softness: 0.5,
}

export const DEFAULT_DRIFT_SPEED = 3.45
export const DEFAULT_PAN_SPEED = 1

/**
 * The view the camera rests at, in radians, before any drag; the slow sway
 * moves around it. Face-on: the sway alone turns it far enough either side
 * for the depth to read, and the picture is recognisable from the first frame.
 */
export const DEFAULT_ANGLE: Pan = { yaw: 0, pitch: 0 }
