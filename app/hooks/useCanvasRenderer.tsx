"use client"

import { useState, useEffect, RefObject } from "react"
import { error as logError } from "@/lib/logger"
import { GameCell, GlobalConfig, CanvasConfig } from "../types"
import { isBrowser } from "../constants"
import { BILIBILI_ICON_PATHS, BILIBILI_ICON_VIEWBOX } from "../utils/bilibiliIcon"
import { getSelectImageSources } from "../utils/imageProxy"
import { parseMainTitle } from "../utils/gridLayout"

const SERIF_FONT =
  '"Songti SC", "Noto Serif SC", "Source Han Serif SC", "SimSun", "Times New Roman", serif'
const SANS_FONT =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif'

interface UseCanvasRendererProps {
  canvasRef: RefObject<HTMLCanvasElement>
  cells: GameCell[]
  setCells: React.Dispatch<React.SetStateAction<GameCell[]>>
  dragOverCellId: number | null
  focusCellId?: number | null
  globalConfig: GlobalConfig
  config: CanvasConfig
}

let cachedIconPaths: Path2D[] | null = null
function getIconPaths(): Path2D[] {
  if (!cachedIconPaths) {
    cachedIconPaths = BILIBILI_ICON_PATHS.map((d) => new Path2D(d))
  }
  return cachedIconPaths
}

/** 把一行文字缩小到能放进 maxWidth，返回字号 */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  baseSize: number,
  maxWidth: number,
  font: (size: number) => string
): number {
  if (!text) return baseSize
  ctx.font = font(baseSize)
  const width = ctx.measureText(text).width
  if (width <= maxWidth || width === 0) return baseSize
  return Math.max(baseSize * 0.4, Math.floor((baseSize * maxWidth) / width))
}

/** 贪心折行（可处理西文空格与中日文逐字） */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines: string[] = []
  let current = ""

  const pushChar = (unit: string) => {
    const next = current + unit
    if (ctx.measureText(next).width <= maxWidth || current.length === 0) {
      current = next
    } else {
      lines.push(current)
      current = unit
    }
  }

  const words = text.split(" ")
  if (words.length > 1) {
    for (let i = 0; i < words.length; i++) {
      const unit = (i === 0 ? "" : " ") + words[i]
      const next = current + unit
      if (ctx.measureText(next).width <= maxWidth || current.length === 0) {
        current = next
      } else {
        lines.push(current)
        current = words[i]
      }
    }
  } else {
    Array.from(text).forEach(pushChar)
  }
  if (current) lines.push(current)

  if (lines.length <= maxLines) return lines

  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last.length > 0 && ctx.measureText(last + "…").width > maxWidth) {
    last = last.slice(0, -1)
  }
  kept[maxLines - 1] = last + "…"
  return kept
}

export function useCanvasRenderer({
  canvasRef,
  cells,
  setCells,
  dragOverCellId,
  focusCellId = null,
  globalConfig,
  config,
}: UseCanvasRendererProps) {
  const [scale, setScale] = useState(1)
  const [canvasLoaded, setCanvasLoaded] = useState(false)

  // 绘制Canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height, padding } = config

    try {
      // 清空并绘制白色背景
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width, height)

      // 主标题：支持两行，第二行可以以小标题号排版
      const { line1, line2, line2IsSub } = parseMainTitle(
        globalConfig.mainTitle || ""
      )
      ctx.fillStyle = "black"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const maxTitleWidth = width - padding * 2
      const baseSize = config.titleFontSize
      const line1Size = fitFontSize(
        ctx,
        line1,
        baseSize,
        maxTitleWidth,
        (size) => `700 ${size}px ${SERIF_FONT}`
      )
      const line2Base = line2IsSub ? baseSize * 0.58 : baseSize
      const line2Size = line2
        ? fitFontSize(
            ctx,
            line2,
            line2Base,
            maxTitleWidth,
            (size) => `700 ${size}px ${SERIF_FONT}`
          )
        : 0
      const gap = line2IsSub ? baseSize * 0.18 : baseSize * 0.22

      if (line2) {
        const blockHeight = line1Size + gap + line2Size
        const startY = padding + (config.titleHeight - blockHeight) / 2
        ctx.font = `700 ${line1Size}px ${SERIF_FONT}`
        ctx.fillText(line1, width / 2, startY + line1Size / 2)
        ctx.font = `700 ${line2Size}px ${SERIF_FONT}`
        ctx.fillText(
          line2,
          width / 2,
          startY + line1Size + gap + line2Size / 2
        )
      } else {
        ctx.font = `700 ${line1Size}px ${SERIF_FONT}`
        ctx.fillText(
          line1,
          width / 2,
          padding + config.titleHeight / 2
        )
      }

      // 绘制单元格
      cells.forEach((cell, index) => {
        if (index >= config.gridRows * config.gridCols) return
        const row = Math.floor(index / config.gridCols)
        const col = index % config.gridCols
        const cellWidth = (width - padding * 2) / config.gridCols
        const gridTop = padding + config.titleHeight
        const cellHeight =
          (height - gridTop - padding) / config.gridRows
        const x = padding + col * cellWidth
        const y = gridTop + row * cellHeight

        // 单元格边框
        ctx.strokeStyle = "black"
        ctx.lineWidth = config.cellBorderWidth
        if (dragOverCellId === cell.id || focusCellId === cell.id) {
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = config.cellBorderWidth * 2
        }
        const inset = config.cellPadding / 2
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(
            x + inset,
            y + inset,
            cellWidth - config.cellPadding,
            cellHeight - config.cellPadding,
            config.cellBorderRadius
          )
        } else {
          ctx.rect(
            x + inset,
            y + inset,
            cellWidth - config.cellPadding,
            cellHeight - config.cellPadding
          )
        }
        ctx.stroke()

        // 封面区域
        const coverX = x + config.cellPadding + config.cellBorderWidth
        const coverY = y + config.cellPadding + config.cellBorderWidth
        const coverWidth =
          cellWidth - config.cellPadding * 2 - config.cellBorderWidth * 2
        const coverHeight = coverWidth / config.coverRatio

        if (cell.imageObj) {
          try {
            ctx.drawImage(cell.imageObj, coverX, coverY, coverWidth, coverHeight)
          } catch (error) {
            logError(`绘制图片失败: ${cell.name || index}`, error)
            drawPlaceholder(ctx, coverX, coverY, coverWidth, coverHeight)
          }
        } else {
          drawPlaceholder(ctx, coverX, coverY, coverWidth, coverHeight)
        }

        // 格子标题（衬线体，过长自动缩小）
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const cellTitleMaxWidth = cellWidth - config.cellPadding * 2
        const cellTitleSize = fitFontSize(
          ctx,
          cell.title,
          config.cellTitleFontSize,
          cellTitleMaxWidth,
          (size) => `600 ${size}px ${SERIF_FONT}`
        )
        ctx.font = `600 ${cellTitleSize}px ${SERIF_FONT}`
        ctx.fillText(
          cell.title,
          x + cellWidth / 2,
          coverY + coverHeight + config.cellTitleMargin + config.cellTitleFontSize / 2
        )

        // 作品名（无衬线体，最多两行）
        if (cell.name) {
          const nameMaxWidth = cellWidth - config.cellPadding * 4
          const baseNameSize = config.cellNameFontSize
          const rawName = cell.name.replace(/\\n/g, "\n")
          const manualBreak = rawName.indexOf("\n")
          const hasManualBreak = manualBreak !== -1
          const nameText = hasManualBreak
            ? rawName.replace(/\n/g, " ")
            : rawName

          ctx.fillStyle = "#4b5563"
          ctx.textBaseline = "alphabetic"
          const nameTop =
            coverY + coverHeight + config.cellTitleMargin + config.cellTitleFontSize + config.cellNameMargin

          let nameSize = Math.floor(baseNameSize)
          ctx.font = `400 ${nameSize}px ${SANS_FONT}`
          const fitsOneLine = ctx.measureText(rawName).width <= nameMaxWidth

          if (hasManualBreak || !fitsOneLine) {
            nameSize = Math.floor(baseNameSize * 0.85)
            ctx.font = `400 ${nameSize}px ${SANS_FONT}`
          }

          const lines = hasManualBreak
            ? rawName
                .split("\n")
                .slice(0, 2)
                .map((line) => {
                  if (ctx.measureText(line).width <= nameMaxWidth) return line
                  return wrapText(ctx, line, nameMaxWidth, 1)[0] ?? ""
                })
            : wrapText(ctx, nameText, nameMaxWidth, 2)

          lines.forEach((line, lineIndex) => {
            if (!line) return
            const lineY =
              nameTop +
              nameSize +
              lineIndex * (nameSize + 1) -
              (hasManualBreak || !fitsOneLine ? 4 : 0)
            ctx.fillText(line, x + cellWidth / 2, lineY)
          })
          ctx.textBaseline = "middle"
        }
      })

      // 水印：左下作者，右下站点
      ctx.fillStyle = "#9ca3af"
      ctx.font = `400 26px ${SANS_FONT}`
      ctx.textBaseline = "alphabetic"
      const watermarkY = height - padding / 2
      ctx.textAlign = "left"
      ctx.fillText("GitHub@Hisou-Tenshi", padding, watermarkY)
      ctx.textAlign = "right"
      ctx.fillText("acgmn-grid.vercel.app", width - padding, watermarkY)
    } catch (error) {
      logError("绘制Canvas时发生错误:", error)
    }
  }

  // 计算Canvas缩放比例并同步画布尺寸
  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return

    const updateScale = () => {
      if (!canvasRef.current) return

      const container = canvasRef.current.parentElement
      const containerWidth = Math.min(
        container?.clientWidth || window.innerWidth,
        1200
      )
      const newScale = containerWidth / config.width
      setScale(newScale)

      const canvas = canvasRef.current
      if (canvas.width !== config.width) canvas.width = config.width
      if (canvas.height !== config.height) canvas.height = config.height
      canvas.style.width = `${config.width * newScale}px`
      canvas.style.height = `${config.height * newScale}px`
      setCanvasLoaded(true)

      requestAnimationFrame(() => {
        drawCanvas()
      })
    }

    updateScale()

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateScale, 100)
    }

    window.addEventListener("resize", handleResize)
    const container = canvasRef.current.parentElement
    const resizeObserver = container ? new ResizeObserver(handleResize) : null
    if (container && resizeObserver) {
      resizeObserver.observe(container)
    }
    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver?.disconnect()
      clearTimeout(resizeTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.width, config.height, drawCanvas])

  // 当cells变化时重新绘制Canvas
  useEffect(() => {
    if (canvasLoaded && isBrowser) {
      requestAnimationFrame(() => {
        drawCanvas()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, canvasLoaded, dragOverCellId, focusCellId, globalConfig, config])

  // 加载图片
  useEffect(() => {
    if (!isBrowser) return

    cells.forEach((cell, index) => {
      if (cell.image && !cell.imageObj) {
        try {
          const imageSrc = getSelectImageSources(cell.image)[0]
          if (!imageSrc) return

          const img = new window.Image()
          img.crossOrigin = "anonymous"
          img.onerror = (err) => {
            logError(`图片加载失败: ${imageSrc}`, err)
          }
          img.onload = () => {
            setCells((prev) => {
              const newCells = [...prev]
              newCells[index] = { ...newCells[index], imageObj: img }
              return newCells
            })
          }
          img.src = imageSrc
        } catch (error) {
          logError("创建图片对象失败:", error)
        }
      }
    })
  }, [cells, setCells])

  // 绘制占位图标（Bilibili 小电视）
  function drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(x, y, width, height)

    const iconSize = Math.min(width, height) * 0.36
    const iconX = x + (width - iconSize) / 2
    const iconY = y + (height - iconSize) / 2

    ctx.save()
    ctx.translate(iconX, iconY)
    ctx.scale(iconSize / BILIBILI_ICON_VIEWBOX, iconSize / BILIBILI_ICON_VIEWBOX)
    ctx.fillStyle = "#c3c7ce"
    try {
      getIconPaths().forEach((path) => ctx.fill(path))
    } catch (error) {
      logError("绘制占位图标失败:", error)
    }
    ctx.restore()
  }

  return {
    scale,
    canvasLoaded,
    drawCanvas,
  }
}
