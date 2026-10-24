import { describe, expect, it } from "vitest"

import {
  MIN_CELL_CSS,
  MIN_GRID,
  clampGrid,
  coverCrop,
  fitScreen,
  maxGrid,
  resolveGrid,
} from "./screen"

describe("fitScreen", () => {
  it.each([
    [{ cols: 64, rows: 36 }, 784, 441, 2],
    [{ cols: 261, rows: 147 }, 784, 441, 2],
    [{ cols: 700, rows: 100 }, 784, 441, 1],
    [{ cols: 13, rows: 97 }, 500, 300, 3],
  ])("never draws %o bigger than its area", (grid, w, h, dpr) => {
    const layout = fitScreen(grid, w, h, dpr)
    expect(layout.cssW).toBeLessThanOrEqual(w)
    expect(layout.cssH).toBeLessThanOrEqual(h)
    expect(Number.isInteger(layout.cell)).toBe(true)
    expect(layout.backingW).toBe(grid.cols * layout.cell)
    expect(layout.backingH).toBe(grid.rows * layout.cell)
  })

  it("keeps every dot square, whatever the grid's shape", () => {
    const layout = fitScreen({ cols: 20, rows: 60 }, 800, 450, 2)
    expect(layout.backingW / 20).toBe(layout.backingH / 60)
  })
})

describe("maxGrid", () => {
  it("leaves at least the minimum cell size for every dot", () => {
    const max = maxGrid(784, 441)
    expect(784 / max.cols).toBeGreaterThanOrEqual(MIN_CELL_CSS)
    expect(441 / max.rows).toBeGreaterThanOrEqual(MIN_CELL_CSS)
  })

  it("never goes below the minimum grid", () => {
    expect(maxGrid(1, 1)).toEqual({ cols: MIN_GRID, rows: MIN_GRID })
  })
})

describe("clampGrid", () => {
  it("pulls an oversized grid back inside the area", () => {
    expect(
      clampGrid({ cols: 900, rows: 900 }, { cols: 261, rows: 147 })
    ).toEqual({ cols: 261, rows: 147 })
  })
})

describe("resolveGrid", () => {
  const max = { cols: 261, rows: 147 }

  it("derives rows from the video's shape when locked", () => {
    const { grid } = resolveGrid({ cols: 64, rows: 5 }, true, 16 / 9, max)
    expect(grid).toEqual({ cols: 64, rows: 36 })
  })

  it("stops columns where the derived rows would no longer fit", () => {
    const tall = 9 / 16
    const { grid, maxCols } = resolveGrid(
      { cols: 261, rows: 1 },
      true,
      tall,
      max
    )
    expect(grid.rows).toBeLessThanOrEqual(max.rows)
    expect(grid.cols).toBe(maxCols)
  })

  it("leaves rows alone when unlocked", () => {
    const { grid } = resolveGrid({ cols: 30, rows: 90 }, false, 16 / 9, max)
    expect(grid).toEqual({ cols: 30, rows: 90 })
  })
})

describe("coverCrop", () => {
  it("crops the sides of a wide video for a square grid", () => {
    expect(coverCrop(1920, 1080, { cols: 10, rows: 10 })).toEqual([
      420, 0, 1080, 1080,
    ])
  })

  it("crops top and bottom of a tall video for a wide grid", () => {
    const [x, y, w, h] = coverCrop(1080, 1920, { cols: 16, rows: 9 })
    expect([x, w]).toEqual([0, 1080])
    expect(h).toBeCloseTo(607.5)
    expect(y).toBeCloseTo((1920 - 607.5) / 2)
  })
})
