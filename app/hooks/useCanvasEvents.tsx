"use client"

import { useState } from "react"
import { CanvasConfig, GameCell } from "../types"
import { saveToIndexedDB } from "../utils/indexedDB"
import { cropImageToAspectRatio } from "@/app/utils/canvasHelpers"
import {
  getClickTarget,
  getCellIdAtPoint,
  isMainTitleHit,
} from "@/app/utils/gridLayout"
import { log, warn, error as logError } from "@/lib/logger"
import { useI18n } from "@/lib/i18n/provider"

interface UseCanvasEventsProps {
  cells: GameCell[]
  setCells: React.Dispatch<React.SetStateAction<GameCell[]>>
  config: CanvasConfig
  openSearchDialog: (cellId: number) => void
  openTitleEditDialog: (cellId: number) => void
  openNameEditDialog: (cellId: number) => void
  openMainTitleEditDialog: () => void
  onImageDrop?: (cellId: number, file: File) => void // 添加拖拽图片的回调
  forceCanvasRedraw?: () => void // 添加强制Canvas重绘的函数
}

/** base64 data URL 的实际字节数。 */
function getBase64Size(dataUrl: string): number {
  const base64Data = dataUrl.split(",")[1] || dataUrl
  const padding = (base64Data.match(/=/g) || []).length
  return (base64Data.length * 3) / 4 - padding
}

/** 渲染 canvas：先尝试无损 PNG，超过体积上限再逐级降 JPEG 质量。 */
function renderCanvasToDownload(
  canvas: HTMLCanvasElement,
  maxBytes: number
): { dataUrl: string; extension: string; size: number } {
  const png = canvas.toDataURL("image/png")
  const pngSize = getBase64Size(png)
  if (pngSize <= maxBytes) {
    return { dataUrl: png, extension: "png", size: pngSize }
  }

  let last = { dataUrl: png, extension: "png", size: pngSize }
  for (const quality of [0.95, 0.9, 0.85, 0.8, 0.75]) {
    const jpeg = canvas.toDataURL("image/jpeg", quality)
    const size = getBase64Size(jpeg)
    last = { dataUrl: jpeg, extension: "jpg", size }
    if (size <= maxBytes) return last
  }
  return last
}

/** 把 data URL 转成 Blob 并触发下载（对 Safari 更稳）。 */
function downloadDataUrl(dataUrl: string, fileName: string): void {
  const byteString = atob(dataUrl.split(",")[1])
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0]
  const buffer = new ArrayBuffer(byteString.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([buffer], { type: mimeString })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.style.display = "none"
  link.href = objectUrl
  link.download = fileName

  document.body.appendChild(link)
  setTimeout(() => {
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    }, 100)
  }, 0)
}

export function useCanvasEvents({
  cells,
  setCells,
  config,
  openSearchDialog,
  openTitleEditDialog,
  openNameEditDialog,
  openMainTitleEditDialog,
  onImageDrop,
  forceCanvasRedraw,
}: UseCanvasEventsProps) {
  const { t } = useI18n()
  const [dragOverCellId, setDragOverCellId] = useState<number | null>(null)

  // 处理Canvas点击事件
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;

    // 获取点击坐标(按画布实际像素换算)
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * config.width) / rect.width;
    const y = ((e.clientY - rect.top) * config.height) / rect.height;

    // 检查是否点击了主标题区域
    if (isMainTitleHit(x, y, config)) {
      openMainTitleEditDialog();
      return;
    }

    // 检查点击的是哪个单元格
    const target = getClickTarget(x, y, config);
    if (target) {
      log(target.cellId, target.area);
      if (target.area === "image") {
        openSearchDialog(target.cellId);
      } else if (target.area === "title") {
        openTitleEditDialog(target.cellId);
      } else {
        openNameEditDialog(target.cellId);
      }
    }
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    // 获取拖拽坐标(按画布实际像素换算)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * config.width) / rect.width
    const y = ((e.clientY - rect.top) * config.height) / rect.height

    // 获取拖拽经过的单元格
    const cellId = getCellIdAtPoint(x, y, config)

    // 更新拖拽经过的单元格ID
    setDragOverCellId(cellId)
    
    // 强制重绘Canvas
    if (forceCanvasRedraw) {
      forceCanvasRedraw();
    }
  }

  const handleDragLeave = () => {
    setDragOverCellId(null)
    
    // 强制重绘Canvas
    if (forceCanvasRedraw) {
      forceCanvasRedraw();
    }
  }

  // 确保图片加载完成后重绘Canvas
  const ensureImageLoaded = (imageUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.src = imageUrl;
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    // 获取拖拽坐标(考虑缩放)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * config.width) / rect.width
    const y = ((e.clientY - rect.top) * config.height) / rect.height

    // 获取拖拽放置的单元格
    const cellId = getCellIdAtPoint(x, y, config)

    // 清除拖拽状态
    setDragOverCellId(null)
    
    // 强制重绘Canvas
    if (forceCanvasRedraw) {
      forceCanvasRedraw();
    }

    if (cellId === null) return

    // 处理拖拽的文件
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      // 检查是否是图片文件
      if (!file.type.startsWith("image/")) {
        logError("只能拖拽图片文件");
        alert("只能拖拽图片文件");
        return
      }

      // 如果提供了 onImageDrop 回调，使用它来处理（会打开裁剪对话框）
      if (onImageDrop) {
        onImageDrop(cellId, file);
        return;
      }

      // 否则使用默认的自动裁剪处理（向后兼容）
      // 限制图片大小为3MB
      const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
      if (file.size > MAX_FILE_SIZE) {
        logError("图片文件过大");
        alert("图片文件过大,请上传小于3MB的图片");
        return
      }

      try {
        // 读取图片文件
        const originalImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        // 裁剪图片为3:4的长宽比
        const croppedImageUrl = await cropImageToAspectRatio(originalImageUrl);
        
        // 确保图片已完全加载
        await ensureImageLoaded(croppedImageUrl);

        // 生成唯一标识,确保React检测到图片URL的变化
        // 这里我们添加一个时间戳参数,确保即使是相同的图片也会被认为是新的URL
        const uniqueImageUrl = `${croppedImageUrl}#t=${Date.now()}`;

        // 更新单元格数据
        const updatedCell: GameCell = {
          ...cells[cellId],
          image: uniqueImageUrl,
          name: file.name.replace(/\.[^/.]+$/, ""), // 移除文件扩展名作为游戏名称
          imageObj: null, // 明确清除旧的图片对象
        }

        // 更新状态
        setCells((prev) => {
          const newCells = [...prev]
          newCells[cellId] = updatedCell
          return newCells
        })

        // 保存到IndexedDB
        await saveToIndexedDB(updatedCell, (reason) => {
          if (reason === "quota") {
            alert(String(t("error.storage_quota")))
          }
        })

        log("图片已添加到格子中");
      } catch (error) {
        logError("读取或处理图片失败:", error)
      }
    }
  }

  // 生成图片（PNG 优先；超出体积上限再降级 JPEG；文件名读取当前语系配置）
  const generateImage = async (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    locale: string
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

      let baseFileName =
        (typeof document !== "undefined" && document.title) ||
        String(t("meta.title"))
      try {
        const savedConfig = localStorage.getItem(`gameGridGlobalConfig_${locale}`)
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig) as { mainTitle?: string }
          if (parsedConfig.mainTitle?.trim()) {
            baseFileName = parsedConfig.mainTitle.trim()
          }
        }
      } catch (error) {
        warn("获取主标题失败:", error)
      }

      baseFileName =
        baseFileName.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80) || "ACGMN+"

      const output = renderCanvasToDownload(canvas, MAX_FILE_SIZE)
      downloadDataUrl(output.dataUrl, `${baseFileName}.${output.extension}`)

      log(
        `图片已生成并下载: ${baseFileName}.${output.extension}, 大小: ${(
          output.size / 1024 / 1024
        ).toFixed(2)}MB`
      )
    } catch (error) {
      logError("生成图片失败:", error)
      alert(String(t("ui.generate_failed")))
    }
  }

  return {
    dragOverCellId,
    handleCanvasClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    generateImage,
  }
}