import { CANVAS_CONFIG } from "../constants"
import { CanvasConfig } from "../types"

/** 行列数（决定格子数量与画布高度） */
export interface GridSize {
  rows: number
  cols: number
}

export interface ClickTarget {
  cellId: number
  area: "image" | "title" | "name"
}

export const MIN_GRID = 1
export const MAX_ROWS = 10
export const MAX_COLS = 10

/** 默认 3×3 九宫格 */
export const DEFAULT_GRID: GridSize = { rows: 3, cols: 3 }

export const GRID_PRESETS: Array<GridSize & { label: string; hint: string }> = [
  { rows: 3, cols: 3, label: "9", hint: "3 × 3" },
  { rows: 4, cols: 4, label: "16", hint: "4 × 4" },
  { rows: 4, cols: 6, label: "24", hint: "4 × 6" },
]

export const GRID_SIZE_STORAGE_KEY = "gameGridSize"

/** 24 格（6 列 4 行）是原始尺寸，其它尺寸以它为基准等比缩放 */
const BASE_CELL_WIDTH =
  (CANVAS_CONFIG.width - CANVAS_CONFIG.padding * 2) / CANVAS_CONFIG.gridCols
const CELL_ASPECT =
  (CANVAS_CONFIG.height -
    CANVAS_CONFIG.padding * 2 -
    CANVAS_CONFIG.titleHeight) /
  CANVAS_CONFIG.gridRows /
  BASE_CELL_WIDTH
/** 两行主标题时给标题区多留的高度 */
const TWO_LINE_TITLE_HEIGHT = CANVAS_CONFIG.titleHeight + 130

export function clampGridSize(size: GridSize): GridSize {
  const clamp = (value: number, max: number) => {
    const n = Number.isFinite(value) ? Math.round(value) : NaN
    if (Number.isNaN(n)) return 1
    return Math.min(max, Math.max(MIN_GRID, n))
  }
  return { rows: clamp(size.rows, MAX_ROWS), cols: clamp(size.cols, MAX_COLS) }
}

export function isPresetSize(size: GridSize): boolean {
  return GRID_PRESETS.some((p) => p.rows === size.rows && p.cols === size.cols)
}

export function presetKey(size: GridSize): string | null {
  const preset = GRID_PRESETS.find(
    (p) => p.rows === size.rows && p.cols === size.cols
  )
  return preset ? preset.label : null
}

export function readStoredGridSize(): GridSize | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(GRID_SIZE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GridSize>
    if (typeof parsed.rows !== "number" || typeof parsed.cols !== "number") {
      return null
    }
    return clampGridSize({ rows: parsed.rows, cols: parsed.cols })
  } catch {
    return null
  }
}

export function saveGridSize(size: GridSize): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GRID_SIZE_STORAGE_KEY, JSON.stringify(size))
  } catch {}
}

/**
 * 把主标题拆成最多两行。
 * 支持真实换行、字面量 `\n`；第二行若以 `\x`（或全角 `＼x`）开头则作为小标题。
 */
export function parseMainTitle(raw: string): {
  line1: string
  line2?: string
  line2IsSub: boolean
} {
  const normalized = (raw ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\\n/g, "\n")
  const parts = normalized.split("\n")
  const line1 = (parts[0] ?? "").trimEnd()
  let line2 = parts.slice(1).join(" ").trim()
  let line2IsSub = false
  if (/^[\\＼]x/.test(line2)) {
    line2IsSub = true
    line2 = line2.slice(2).trimStart()
  }
  return { line1, line2: line2 || undefined, line2IsSub }
}

export function getMainTitleLines(raw: string): 1 | 2 {
  return parseMainTitle(raw).line2 ? 2 : 1
}

/**
 * 依据行列数生成画布配置：宽度固定 2400，格子等比缩放，画布高度随行数增长。
 * 24 格（4×6）的结果与原始 CANVAS_CONFIG 完全一致。
 */
export function computeCanvasConfig(
  size: GridSize,
  titleLines: 1 | 2 = 1
): CanvasConfig {
  const { rows, cols } = clampGridSize(size)
  const width = CANVAS_CONFIG.width
  const padding = CANVAS_CONFIG.padding
  const cellWidth = (width - padding * 2) / cols
  const scale = cellWidth / BASE_CELL_WIDTH

  const cellPadding = CANVAS_CONFIG.cellPadding * scale
  const cellBorderWidth = CANVAS_CONFIG.cellBorderWidth * scale
  const cellTitleFontSize = CANVAS_CONFIG.cellTitleFontSize * scale
  const cellNameFontSize = CANVAS_CONFIG.cellNameFontSize * scale
  const cellTitleMargin = CANVAS_CONFIG.cellTitleMargin * scale
  const cellNameMargin = CANVAS_CONFIG.cellNameMargin * scale
  const titleHeight =
    titleLines === 2 ? TWO_LINE_TITLE_HEIGHT : CANVAS_CONFIG.titleHeight

  const cellHeight = cellWidth * CELL_ASPECT
  const height = padding * 2 + titleHeight + rows * cellHeight

  return {
    ...CANVAS_CONFIG,
    width,
    height,
    gridRows: rows,
    gridCols: cols,
    titleHeight,
    cellPadding,
    cellBorderWidth,
    cellBorderRadius: CANVAS_CONFIG.cellBorderRadius * scale,
    cellTitleFontSize,
    cellNameFontSize,
    cellTitleMargin,
    cellNameMargin,
  }
}

export interface CellMetrics {
  index: number
  row: number
  col: number
  /** 格子左上角 */
  x: number
  y: number
  width: number
  height: number
  /** 边框矩形（与画布绘制保持一致） */
  borderX: number
  borderY: number
  borderWidth: number
  borderHeight: number
  coverX: number
  coverY: number
  coverWidth: number
  coverHeight: number
  /** 标题文字区域 */
  titleTop: number
  titleBottom: number
  /** 名称区域上边界 */
  nameTop: number
}

export function getGridTop(config: CanvasConfig): number {
  return config.padding + config.titleHeight
}

export function getCellWidth(config: CanvasConfig): number {
  return (config.width - config.padding * 2) / config.gridCols
}

export function getCellMetrics(
  config: CanvasConfig,
  index: number
): CellMetrics {
  const row = Math.floor(index / config.gridCols)
  const col = index % config.gridCols
  const cellWidth = getCellWidth(config)
  const gridTop = getGridTop(config)
  const cellHeight =
    (config.height - gridTop - config.padding) / config.gridRows
  const x = config.padding + col * cellWidth
  const y = gridTop + row * cellHeight

  const inset = config.cellPadding / 2
  const coverX = x + config.cellPadding + config.cellBorderWidth
  const coverY = y + config.cellPadding + config.cellBorderWidth
  const coverWidth =
    cellWidth -
    config.cellPadding * 2 -
    config.cellBorderWidth * 2
  const coverHeight = coverWidth / config.coverRatio
  const titleTop = coverY + coverHeight + config.cellTitleMargin
  const titleBottom = titleTop + config.cellTitleFontSize
  const nameTop = titleBottom + config.cellNameMargin

  return {
    index,
    row,
    col,
    x,
    y,
    width: cellWidth,
    height: cellHeight,
    borderX: x + inset,
    borderY: y + inset,
    borderWidth: cellWidth - config.cellPadding,
    borderHeight: cellHeight - config.cellPadding,
    coverX,
    coverY,
    coverWidth,
    coverHeight,
    titleTop,
    titleBottom,
    nameTop,
  }
}

export function getCellIdAtPoint(
  x: number,
  y: number,
  config: CanvasConfig
): number | null {
  const gridTop = getGridTop(config)
  if (
    x < config.padding ||
    y < gridTop ||
    x > config.width - config.padding ||
    y > config.height - config.padding
  ) {
    return null
  }
  const cellWidth = getCellWidth(config)
  const cellHeight =
    (config.height - gridTop - config.padding) / config.gridRows
  const col = Math.floor((x - config.padding) / cellWidth)
  const row = Math.floor((y - gridTop) / cellHeight)
  if (col < 0 || col >= config.gridCols || row < 0 || row >= config.gridRows) {
    return null
  }
  return row * config.gridCols + col
}

export function getClickTarget(
  x: number,
  y: number,
  config: CanvasConfig
): ClickTarget | null {
  const cellId = getCellIdAtPoint(x, y, config)
  if (cellId === null) return null

  const metrics = getCellMetrics(config, cellId)
  if (y < metrics.coverY + metrics.coverHeight) {
    return { cellId, area: "image" }
  }
  if (y < metrics.titleBottom + config.cellNameMargin / 2) {
    return { cellId, area: "title" }
  }
  return { cellId, area: "name" }
}

/** 画布内主标题是否落点 */
export function isMainTitleHit(
  x: number,
  y: number,
  config: CanvasConfig
): boolean {
  return (
    y < config.padding + config.titleHeight &&
    x >= config.padding &&
    x <= config.width - config.padding
  )
}
