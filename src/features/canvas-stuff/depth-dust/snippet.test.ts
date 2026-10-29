import { describe, expect, it } from "vitest"

import {
  DEFAULT_ANGLE,
  DEFAULT_DRIFT_SPEED,
  DEFAULT_PAN_SPEED,
  DEFAULT_SETTINGS,
} from "./defaults"
import { depthDustSnippet } from "./snippet"
import type { SnippetInput } from "./snippet"

const defaults: SnippetInput = {
  ...DEFAULT_SETTINGS,
  driftSpeed: DEFAULT_DRIFT_SPEED,
  light: false,
  pan: true,
  panSpeed: DEFAULT_PAN_SPEED,
  angle: DEFAULT_ANGLE,
}

describe("depthDustSnippet", () => {
  it("lists only the picture and depth map at the defaults", () => {
    expect(depthDustSnippet(defaults)).toBe(
      [
        `import { DepthDust } from "side-quests-lab"`,
        "",
        "<DepthDust",
        `  src="/your-picture.jpg"`,
        `  depthMap="/its-depth.png"`,
        "/>",
      ].join("\n")
    )
  })

  it("adds exactly the props that changed", () => {
    const snippet = depthDustSnippet({
      ...defaults,
      drift: 1,
      particles: "streaks",
      driftSpeed: 2.5,
      reach: 4,
      light: true,
    })
    expect(snippet).toContain("reach={4}")
    expect(snippet).not.toContain("spread")
    expect(snippet).not.toContain("angle")
    expect(snippet).toContain("drift={1}")
    expect(snippet).toContain(`particles="streaks"`)
    expect(snippet).toContain("driftSpeed={2.5}")
    expect(snippet).toContain(`theme="light"`)
    expect(snippet).not.toContain("splash")
    expect(snippet).not.toContain("line=")
  })

  it("writes a moved line with rounded coordinates", () => {
    const snippet = depthDustSnippet({
      ...defaults,
      line: { a: { x: 0.1234, y: 0 }, b: { x: 1, y: 0.5678 } },
    })
    expect(snippet).toContain(
      "line={{ a: { x: 0.12, y: 0 }, b: { x: 1, y: 0.57 } }}"
    )
  })

  it("drops pan speed when panning is off", () => {
    const snippet = depthDustSnippet({ ...defaults, pan: false, panSpeed: 2 })
    expect(snippet).toContain("pan={false}")
    expect(snippet).not.toContain("panSpeed")
  })

  it("writes the view angle once you've dragged away from the default", () => {
    const snippet = depthDustSnippet({
      ...defaults,
      angle: { yaw: -0.3, pitch: 0.123 },
    })
    expect(snippet).toContain("angle={{ yaw: -0.3, pitch: 0.12 }}")
  })
})
