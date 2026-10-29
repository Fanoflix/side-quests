import type { CSSProperties } from "react"

import {
  DEFAULT_ANGLE,
  DEFAULT_DRIFT_SPEED,
  DEFAULT_PAN_SPEED,
  DEFAULT_SETTINGS,
} from "../../../src/features/canvas-stuff/depth-dust/defaults"
import type { Pan } from "../../../src/features/canvas-stuff/depth-dust/usePan"
import type {
  DriftLine,
  Particles,
} from "../../../src/features/canvas-stuff/depth-dust/field"
import { useDepthDust } from "./useDepthDust"
import type { DepthMapSource } from "./useDepthDust"

export type DepthDustProps = {
  /** The picture. Any URL an `<img>` can load (same-origin or CORS-enabled). */
  src: string
  /**
   * Its depth: a depth-map image URL (greyscale, white = near), a map in
   * memory, or a function that estimates one — e.g. `estimateDepth` from
   * `side-quests-lab/estimate`. Make one ahead of time with
   * `npx side-quests-lab depth picture.jpg depth.png`.
   */
  depthMap: DepthMapSource
  /** How much the dust moves and how much blows off, 0–2. @defaultValue `0.72` */
  drift?: number
  /** Share of points thrown loose to orbit the picture, 0–1. @defaultValue `0.15` */
  splash?: number
  /** How tightly points hold their place, 0–1. @defaultValue `0.95` */
  gather?: number
  /** How far near things push towards you, 0–1. @defaultValue `0.84` */
  depth?: number
  /**
   * Past this line, the picture blows away as a plume. Two points in picture
   * space ((0, 0) top left, (1, 1) bottom right); facing from `a` to `b`, the
   * plume goes left. @defaultValue a shallow diagonal blowing up and to the right
   */
  line?: DriftLine
  /** How the plume is drawn. @defaultValue `"comets"` */
  particles?: Particles
  /** How fast the plume travels, as a multiplier. @defaultValue `3.45` */
  driftSpeed?: number
  /** How far the plume travels, as a multiplier, 0.25–8. @defaultValue `0.25` */
  reach?: number
  /** How much each plume particle's direction varies, 0–1. @defaultValue `0.25` */
  spread?: number
  /** How wide the band where the drift starts is, 0–1. @defaultValue `0.5` */
  softness?: number
  /** Glowing on a dark page, or true colour on a light one. @defaultValue `"dark"` */
  theme?: "dark" | "light"
  /** Drag to turn the picture and look around. @defaultValue `true` */
  pan?: boolean
  /** How far a drag turns it, as a multiplier. @defaultValue `1` */
  panSpeed?: number
  /**
   * The view the camera rests at, in radians: yaw turns it side to side,
   * pitch up and down. The slow sway moves around it, and turning `pan` off
   * returns to it. @defaultValue `{ yaw: 0.45, pitch: 0.08 }`
   */
  angle?: Pan
  /** Point budget. Fewer is lighter on phones. @defaultValue `524288` */
  points?: number
  /** Change this to replay the gather-in. @defaultValue `0` */
  playToken?: number
  /** Called when the picture or depth map fails to load, or WebGL2 is missing. */
  onError?: (error: unknown) => void
  className?: string
  /** Size it here or with `className`. Without a height it is 16:10. */
  style?: CSSProperties
  /** @defaultValue `"The picture, drawn as a cloud of moving points"` */
  "aria-label"?: string
}

/**
 * A picture drawn as half a million points, each pushed towards you by how
 * close it is, drifting, swaying and blowing away past a line. Fills its
 * container's width; give it a height or it takes a 16:10 shape.
 */
export function DepthDust({
  src,
  depthMap,
  drift = DEFAULT_SETTINGS.drift,
  splash = DEFAULT_SETTINGS.splash,
  gather = DEFAULT_SETTINGS.gather,
  depth = DEFAULT_SETTINGS.depth,
  line = DEFAULT_SETTINGS.line,
  particles = DEFAULT_SETTINGS.particles,
  driftSpeed = DEFAULT_DRIFT_SPEED,
  reach = DEFAULT_SETTINGS.reach,
  spread = DEFAULT_SETTINGS.spread,
  softness = DEFAULT_SETTINGS.softness,
  theme = "dark",
  pan = true,
  panSpeed = DEFAULT_PAN_SPEED,
  angle = DEFAULT_ANGLE,
  points,
  playToken = 0,
  onError,
  className,
  style,
  "aria-label": ariaLabel = "The picture, drawn as a cloud of moving points",
}: DepthDustProps) {
  const { canvasRef, dragging, onPointerDown, onPointerMove, endDrag } =
    useDepthDust({
      src,
      depthMap,
      settings: {
        drift,
        splash,
        gather,
        depth,
        line,
        particles,
        spread,
        reach,
        softness,
      },
      light: theme === "light",
      driftSpeed,
      points,
      panEnabled: pan,
      panSpeed,
      angle,
      playToken,
      onError,
    })

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        display: "block",
        width: "100%",
        aspectRatio: "16 / 10",
        touchAction: pan ? "none" : undefined,
        cursor: pan ? (dragging ? "grabbing" : "grab") : undefined,
        ...style,
      }}
    />
  )
}
