import { describe, expect, it } from "vitest"

import { DEFAULT_LINE } from "./field"
import { depthDustSnippet } from "./snippet"
import type { SnippetInput } from "./snippet"

const defaults: SnippetInput = {
  drift: 0.9,
  splash: 0.15,
  gather: 0.95,
  depth: 0.2,
  line: DEFAULT_LINE,
  particles: "subtle",
  spread: 0.5,
  reach: 1,
  softness: 0.5,
  driftSpeed: 1,
  light: false,
  pan: true,
  panSpeed: 1,
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
})
