import { DEFAULT_LINE } from "./field"
import type { DustSettings } from "./field"
import type { Pan } from "./usePan"

/**
 * The look Depth Dust opens with, tuned by eye on the helm: a still, deep
 * picture turned a little to one side, with comets lifting gently off its
 * upper right. One source for the tool page, the published component's prop
 * defaults and the copy-paste snippet (which lists only what differs from
 * these), so the three can't drift apart.
 */
export const DEFAULT_SETTINGS: DustSettings = {
  drift: 0.72,
  splash: 0.15,
  gather: 0.95,
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
 * moves around it. Turned so the picture's right side recedes, which is what
 * makes the depth read at a glance.
 */
export const DEFAULT_ANGLE: Pan = { yaw: 0.45, pitch: 0.08 }
