import { describe, expect, it } from "vitest"

import {
  DEFAULT_LINE,
  FULL_POINTS,
  cameraDistance,
  gridFor,
  lineNormal,
  pointGain,
} from "./field"

describe("gridFor", () => {
  it.each([16 / 9, 1, 3 / 4, 1200 / 670, 21 / 9, 9 / 21])(
    "never spends more than the point budget at aspect %d",
    (aspect) => {
      const { cols, rows } = gridFor(aspect, FULL_POINTS)
      expect(cols * rows).toBeLessThanOrEqual(FULL_POINTS)
      expect(cols * rows).toBeGreaterThan(FULL_POINTS * 0.99)
    }
  )

  it("keeps cells square by matching the picture's shape", () => {
    const { cols, rows } = gridFor(2, FULL_POINTS)
    expect(cols / rows).toBeCloseTo(2, 1)
  })

  it("still makes a grid from a tiny budget", () => {
    expect(gridFor(16 / 9, 1)).toEqual({ cols: 1, rows: 1 })
  })
})

describe("cameraDistance", () => {
  it("is limited by height when the picture is narrower than the view", () => {
    expect(cameraDistance(1, 2)).toBe(cameraDistance(1.5, 2))
  })

  it("backs off for a picture wider than the view", () => {
    expect(cameraDistance(3, 1)).toBeGreaterThan(cameraDistance(1, 1))
    expect(cameraDistance(4, 1) / cameraDistance(2, 1)).toBeCloseTo(2)
  })
})

describe("pointGain", () => {
  it("dims points as they pile up, so exposure holds at any size", () => {
    const small = pointGain(FULL_POINTS, 2, 400_000)
    const large = pointGain(FULL_POINTS, 2, 1_600_000)
    expect(small).toBeLessThan(large)
  })

  it("never brightens a single point past full strength", () => {
    expect(pointGain(1000, 1, 10_000_000)).toBe(1)
  })

  it("never fades points out entirely", () => {
    expect(pointGain(FULL_POINTS * 100, 4, 1)).toBe(0.04)
  })
})

describe("lineNormal", () => {
  it("points left of the line, facing from a to b", () => {
    const down = { a: { x: 0.5, y: 0 }, b: { x: 0.5, y: 1 } }
    expect(lineNormal(down, 1).x).toBeCloseTo(1)
    expect(lineNormal(down, 1).y).toBeCloseTo(0)
  })

  it("flips when the ends swap", () => {
    const n = lineNormal(DEFAULT_LINE, 16 / 9)
    const flipped = lineNormal({ a: DEFAULT_LINE.b, b: DEFAULT_LINE.a }, 16 / 9)
    expect(flipped.x).toBeCloseTo(-n.x)
    expect(flipped.y).toBeCloseTo(-n.y)
  })

  it("is a unit vector in the picture's real proportions", () => {
    const n = lineNormal({ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, 2)
    expect(Math.hypot(n.x, n.y)).toBeCloseTo(1)
    // A 45° line in picture space is shallower on a 2:1 picture, so its
    // normal leans further from horizontal.
    expect(Math.abs(n.y)).toBeGreaterThan(Math.abs(n.x))
  })

  it("blows up and to the right by default", () => {
    const n = lineNormal(DEFAULT_LINE, 16 / 9)
    expect(n.x).toBeGreaterThan(0)
    expect(n.y).toBeLessThan(0)
  })
})
