export type DotShape = "circle" | "square" | "diamond"

export type Look = {
  shape: DotShape
  fill: number
  glow: boolean
}

export type Grid = { cols: number; rows: number }

export type ScreenLayout = {
  cell: number
  backingW: number
  backingH: number
  cssW: number
  cssH: number
}

export const MIN_GRID = 4
export const MIN_CELL_CSS = 3
export const MAX_SCREEN_H = 560

export function maxGrid(areaW: number, areaH: number): Grid {
  return {
    cols: Math.max(MIN_GRID, Math.floor(areaW / MIN_CELL_CSS)),
    rows: Math.max(MIN_GRID, Math.floor(areaH / MIN_CELL_CSS)),
  }
}

export function clampGrid(grid: Grid, max: Grid): Grid {
  return {
    cols: Math.min(max.cols, Math.max(MIN_GRID, Math.round(grid.cols))),
    rows: Math.min(max.rows, Math.max(MIN_GRID, Math.round(grid.rows))),
  }
}

export function fitScreen(
  grid: Grid,
  areaW: number,
  areaH: number,
  dpr: number
): ScreenLayout {
  const cell = Math.max(
    1,
    Math.floor(Math.min((areaW * dpr) / grid.cols, (areaH * dpr) / grid.rows))
  )
  const backingW = grid.cols * cell
  const backingH = grid.rows * cell
  return {
    cell,
    backingW,
    backingH,
    cssW: backingW / dpr,
    cssH: backingH / dpr,
  }
}

export function coverCrop(
  sourceW: number,
  sourceH: number,
  grid: Grid
): [number, number, number, number] {
  const target = grid.cols / grid.rows
  const source = sourceW / sourceH
  if (source > target) {
    const w = sourceH * target
    return [(sourceW - w) / 2, 0, w, sourceH]
  }
  const h = sourceW / target
  return [0, (sourceH - h) / 2, sourceW, h]
}

export function drawDotTile(
  ctx: CanvasRenderingContext2D,
  cell: number,
  look: Pick<Look, "shape" | "fill">
) {
  const size = Math.max(1, Math.round(cell * look.fill))
  const offset = (cell - size) / 2
  ctx.clearRect(0, 0, cell, cell)
  ctx.fillStyle = "#000"
  ctx.beginPath()
  if (look.shape === "square" || size <= 2) {
    ctx.rect(Math.floor(offset), Math.floor(offset), size, size)
  } else if (look.shape === "circle") {
    ctx.arc(cell / 2, cell / 2, size / 2, 0, Math.PI * 2)
  } else {
    const c = cell / 2
    const r = size / 2
    ctx.moveTo(c, c - r)
    ctx.lineTo(c + r, c)
    ctx.lineTo(c, c + r)
    ctx.lineTo(c - r, c)
    ctx.closePath()
  }
  ctx.fill()
}

export function formatDots(grid: Grid) {
  return `${(grid.cols * grid.rows).toLocaleString("en-US")} dots`
}

export function resolveGrid(
  wanted: Grid,
  lockToVideo: boolean,
  aspect: number,
  max: Grid
): { grid: Grid; maxCols: number } {
  if (!lockToVideo) return { grid: clampGrid(wanted, max), maxCols: max.cols }
  const maxCols = Math.max(
    MIN_GRID,
    Math.min(max.cols, Math.floor(max.rows * aspect))
  )
  const cols = Math.min(maxCols, Math.max(MIN_GRID, Math.round(wanted.cols)))
  const rows = Math.min(max.rows, Math.max(MIN_GRID, Math.round(cols / aspect)))
  return { grid: { cols, rows }, maxCols }
}
