"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import NextImage from "next/image"
import { log, error as logError } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/provider"
import { GameCell, GameSearchResult, GlobalConfig } from "../types"
import { loadCellsFromDB, saveToIndexedDB } from "../utils/indexedDB"
import { GameSearchDialog } from "./GameSearchDialog"
import { TextEditDialog } from "./TextEditDialog"
import { ImageCropDialog } from "./ImageCropDialog"
import { useCanvasRenderer } from "../hooks/useCanvasRenderer"
import { useCanvasEvents } from "../hooks/useCanvasEvents"
import { getSelectImageSources } from "../utils/imageProxy"
import {
  DEFAULT_GRID,
  GRID_PRESETS,
  GridSize,
  MAX_COLS,
  MAX_ROWS,
  clampGridSize,
  computeCanvasConfig,
  getMainTitleLines,
  isPresetSize,
  parseMainTitle,
  readStoredGridSize,
  saveGridSize,
} from "../utils/gridLayout"
import {
  FALLBACK_CELL_TITLES_16,
  FALLBACK_CELL_TITLES_9,
} from "../constants"

/**
 * 依次尝试候选地址，返回第一张能成功下载并解码的图片。
 * 官方地址优先，失败后自动回退到代理地址。
 */
async function loadFirstAvailableImage(sources: string[]): Promise<Blob | null> {
  for (const source of sources) {
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(15_000) })
      if (!response.ok) continue
      const blob = await response.blob()
      if (!blob.type.startsWith("image/")) continue
      await decodeImageBlob(blob)
      return blob
    } catch {
      continue
    }
  }
  return null
}

function decodeImageBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    const timer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("image_decode_timeout"))
    }, 15_000)
    img.onload = () => {
      clearTimeout(timer)
      URL.revokeObjectURL(objectUrl)
      resolve()
    }
    img.onerror = () => {
      clearTimeout(timer)
      URL.revokeObjectURL(objectUrl)
      reject(new Error("image_decode_failed"))
    }
    img.src = objectUrl
  })
}

interface GameGridProps {
  initialCells: GameCell[]
  onUpdateCells: (cells: GameCell[]) => void
}

export function GameGrid({ initialCells, onUpdateCells }: GameGridProps) {
  // Canvas相关状态
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cells, setCells] = useState<GameCell[]>(initialCells)
  // 键盘操作时高亮的格子（Tab 聚焦画布后可用方向键移动）
  const [keyboardFocusCellId, setKeyboardFocusCellId] = useState<number | null>(null)
  const { t, locale } = useI18n()

  // 格子规模：默认 9 格；老用户（已有 9 格以外的数据）自动沿用 24 格
  const [gridSize, setGridSize] = useState<GridSize>(DEFAULT_GRID)
  const [sizeReady, setSizeReady] = useState(false)
  const [customMode, setCustomMode] = useState(false)

  // 全局配置状态
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    mainTitle: ""
  })

  // 标题自定义覆盖（默认标题随语系 / 格子数变化，不写入格子数据）
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({})

  // 搜索与编辑状态
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [isMainTitleDialogOpen, setIsMainTitleDialogOpen] = useState(false)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [isExampleOpen, setIsExampleOpen] = useState(false)
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null)

  const rowCount = gridSize.rows * gridSize.cols

  // 默认标题：9 / 16 / 24 使用预设，自定义尺寸统一占位文字
  const defaultTitles = useMemo(() => {
    const titles24 = t('cell_titles')
    const titles9 = t('cell_titles_9')
    const titles16 = t('cell_titles_16')

    if (gridSize.rows === 3 && gridSize.cols === 3) {
      return Array.isArray(titles9) && titles9.length >= 9
        ? (titles9 as string[]).slice(0, 9)
        : FALLBACK_CELL_TITLES_9
    }
    if (gridSize.rows === 4 && gridSize.cols === 4) {
      return Array.isArray(titles16) && titles16.length >= 16
        ? (titles16 as string[]).slice(0, 16)
        : FALLBACK_CELL_TITLES_16
    }
    if (gridSize.rows === 4 && gridSize.cols === 6) {
      return Array.isArray(titles24) && titles24.length >= 24
        ? (titles24 as string[]).slice(0, 24)
        : Array.from({ length: 24 }, () => String(t('grid.placeholder_title')))
    }
    return Array.from({ length: rowCount }, () =>
      String(t('grid.placeholder_title'))
    )
  }, [t, gridSize.rows, gridSize.cols, rowCount])

  // 渲染用单元格：叠加标题覆盖
  const visibleCells = useMemo(() => {
    return Array.from({ length: rowCount }, (_, index) => {
      const raw = cells[index]
      return {
        id: index,
        title:
          titleOverrides[String(index)] ??
          defaultTitles[index] ??
          String(t('grid.placeholder_title')),
        image: raw?.image,
        name: raw?.name,
        imageObj: raw?.imageObj ?? null,
      } as GameCell
    })
  }, [cells, rowCount, titleOverrides, defaultTitles, t])

  const titleLines = useMemo(
    () => getMainTitleLines(globalConfig.mainTitle),
    [globalConfig.mainTitle]
  )
  const config = useMemo(
    () => computeCanvasConfig(gridSize, titleLines),
    [gridSize, titleLines]
  )

  // 初始化：读取上次选择的格子规模 / 标题覆盖
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const stored = readStoredGridSize()
        if (stored) {
          setGridSize(stored)
          setCustomMode(!isPresetSize(stored))
        } else {
          // 老用户检测：本地有 9 格以外的标题覆盖，或数据库里有 9 格以外的数据
          let hasLegacy = false
          try {
            const raw = localStorage.getItem(`gameGridTitles_${locale}`)
            if (raw) {
              const map = JSON.parse(raw) as Record<string, string>
              hasLegacy = Object.keys(map).some((key) => Number(key) >= 9)
            }
          } catch {}
          if (!hasLegacy) {
            const saved = await loadCellsFromDB()
            hasLegacy = saved.some(
              (cell) =>
                cell.id >= 9 && Boolean(cell.image || cell.name)
            )
          }
          if (!cancelled) {
            setGridSize(hasLegacy ? { rows: 4, cols: 6 } : DEFAULT_GRID)
          }
        }
      } finally {
        if (!cancelled) setSizeReady(true)
      }
    }

    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 语系切换：读取默认主标题与该语系的标题覆盖
  useEffect(() => {
    const storageKey = `gameGridGlobalConfig_${locale}`
    const savedConfig =
      typeof window !== 'undefined'
        ? localStorage.getItem(storageKey) || localStorage.getItem('gameGridGlobalConfig')
        : null
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setGlobalConfig(parsed)
        if (typeof document !== 'undefined' && parsed.mainTitle) {
          const { line1, line2 } = parseMainTitle(parsed.mainTitle)
          document.title = line2 ? `${line1} ${line2}` : line1
        }
      } catch {}
    } else {
      const defaultTitle = String(t('global.main_title'))
      setGlobalConfig((prev) => ({ ...prev, mainTitle: defaultTitle }))
      if (typeof document !== 'undefined') {
        document.title = defaultTitle
      }
    }

    try {
      const raw = localStorage.getItem(`gameGridTitles_${locale}`)
      setTitleOverrides(raw ? (JSON.parse(raw) as Record<string, string>) : {})
    } catch {
      setTitleOverrides({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  // 当可见格子变化时，通知父组件
  useEffect(() => {
    onUpdateCells(visibleCells)
  }, [visibleCells, onUpdateCells])

  // 切换格子数：补齐数据，并从 IndexedDB 恢复此前隐藏的封面 / 名称
  const changeGridSize = (next: GridSize) => {
    const size = clampGridSize(next)
    setGridSize(size)
    saveGridSize(size)
    setCustomMode(!isPresetSize(size))
    setKeyboardFocusCellId(null)

    const count = size.rows * size.cols
    setCells((prev) => {
      if (prev.length >= count) return prev
      const filled = [...prev]
      for (let i = prev.length; i < count; i++) {
        filled.push({ id: i, title: "", imageObj: null })
      }
      return filled
    })

    loadCellsFromDB()
      .then((saved) => {
        if (saved.length === 0) return
        setCells((prev) => {
          const nextCells = [...prev]
          saved.forEach((savedCell) => {
            if (savedCell.id >= count) return
            if (nextCells[savedCell.id]?.image || nextCells[savedCell.id]?.name) return
            nextCells[savedCell.id] = {
              ...(nextCells[savedCell.id] ?? { id: savedCell.id, title: "" }),
              image: savedCell.image,
              name: savedCell.name,
              imageObj: null,
            }
          })
          return nextCells
        })
      })
      .catch(() => {})
  }

  // 打开搜索对话框
  const openSearchDialog = (cellId: number) => {
    log("openSearchDialog")
    setSelectedCellId(cellId);
    setIsSearchDialogOpen(true);
  };

  // 打开标题编辑对话框
  const openTitleEditDialog = (cellId: number) => {
    setSelectedCellId(cellId);
    setEditingText(visibleCells[cellId]?.title ?? "");
    setIsTitleDialogOpen(true);
  };

  // 打开游戏名称编辑对话框
  const openNameEditDialog = (cellId: number) => {
    setSelectedCellId(cellId);
    setEditingText(cells[cellId]?.name || "");
    setIsNameDialogOpen(true);
  };

  // 打开主标题编辑对话框
  const openMainTitleEditDialog = () => {
    setEditingText(globalConfig.mainTitle);
    setIsMainTitleDialogOpen(true);
  };

  // 处理拖拽图片 - 打开裁剪对话框
  const handleImageDrop = async (cellId: number, file: File) => {
    setSelectedCellId(cellId);

    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_FILE_SIZE) {
      alert(t('error.file_too_large', { size: '3MB' }) || '图片文件过大，请上传小于3MB的图片');
      return;
    }

    try {
      const imageSrc = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to read image'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Invalid image format'));
        img.src = imageSrc;
      });

      setUploadedImageSrc(imageSrc);

      setTimeout(() => {
        setIsCropDialogOpen(true);
      }, 100);
    } catch (error) {
      logError('读取拖拽图片失败:', error);
      alert(t('error.image_load_failed_select_another'));
    }
  };

  // IndexedDB 写入失败提示（配额不足时给出可操作建议）
  const handleStorageError = (reason: "quota" | "unknown") => {
    if (reason === "quota") {
      alert(String(t('error.storage_quota')));
    } else {
      logError("保存数据到 IndexedDB 失败");
    }
  };

  const { scale, drawCanvas } = useCanvasRenderer({
    canvasRef,
    cells: visibleCells,
    setCells,
    dragOverCellId: null,
    focusCellId: keyboardFocusCellId,
    globalConfig,
    config,
  });

  const {
    dragOverCellId: currentDragOverCellId,
    handleCanvasClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    generateImage
  } = useCanvasEvents({
    cells: visibleCells,
    setCells,
    config,
    openSearchDialog,
    openTitleEditDialog,
    openNameEditDialog,
    openMainTitleEditDialog,
    onImageDrop: handleImageDrop,
    forceCanvasRedraw: drawCanvas,
  });

  useEffect(() => {
    if (drawCanvas) {
      drawCanvas();
    }
  }, [currentDragOverCellId, keyboardFocusCellId, globalConfig, drawCanvas]);

  // 保存标题更改
  const handleSaveTitle = (newText: string) => {
    if (selectedCellId === null) return;

    setTitleOverrides((prev) => {
      const next = { ...prev, [String(selectedCellId)]: newText };
      try {
        localStorage.setItem(
          `gameGridTitles_${locale}`,
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
    setIsTitleDialogOpen(false);
  };

  // 保存游戏名称更改
  const handleSaveName = (newText: string) => {
    if (selectedCellId === null) return;

    const base = cells[selectedCellId] ?? { id: selectedCellId, title: "" };
    const updatedCell: GameCell = {
      ...base,
      name: newText,
    };

    setCells((prev) => {
      const next = [...prev];
      next[selectedCellId] = updatedCell;
      return next;
    });
    saveToIndexedDB(updatedCell, handleStorageError);
    setIsNameDialogOpen(false);
  };

  // 保存主标题更改
  const handleSaveMainTitle = (input: string) => {
    const newText = input.trim() ? input : String(t('global.main_title'));
    const updatedConfig = {
      ...globalConfig,
      mainTitle: newText
    };

    setGlobalConfig(updatedConfig);
    setIsMainTitleDialogOpen(false);

    try {
      localStorage.setItem(
        `gameGridGlobalConfig_${locale}`,
        JSON.stringify(updatedConfig)
      );
    } catch {}

    if (typeof document !== 'undefined') {
      const { line1, line2 } = parseMainTitle(newText);
      document.title = line2 ? `${line1} ${line2}` : line1;
    }
  };

  // 清空格子：恢复默认标题，移除封面与作品名
  const handleClearCell = () => {
    if (selectedCellId === null) return;
    const cellId = selectedCellId;
    const hasContent = Boolean(cells[cellId]?.image || cells[cellId]?.name);
    if (
      hasContent &&
      !window.confirm(String(t('grid.clear_confirm')))
    ) {
      return;
    }

    const resetCell: GameCell = { id: cellId, title: "", imageObj: null };
    setCells((prev) => {
      const next = [...prev];
      next[cellId] = resetCell;
      return next;
    });
    setTitleOverrides((prev) => {
      if (!(String(cellId) in prev)) return prev;
      const next = { ...prev };
      delete next[String(cellId)];
      try {
        localStorage.setItem(
          `gameGridTitles_${locale}`,
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
    saveToIndexedDB(resetCell, handleStorageError);
    setIsSearchDialogOpen(false);
    setSelectedCellId(null);
  };

  // 选择游戏
  const handleSelectGame = async (game: GameSearchResult) => {
    if (selectedCellId === null) return;

    const cellId = selectedCellId;
    const prevCell = visibleCells[cellId];
    const originalImageUrl = game.image || "";
    const imageSources = getSelectImageSources(originalImageUrl);

    // 当搜索结果没有图时，仅导入到「作品名称」
    if (imageSources.length === 0) {
      const updatedCell: GameCell = {
        ...prevCell,
        name: game.name,
        image: undefined,
        imageObj: null,
      };
      setCells((prev) => {
        const next = [...prev];
        next[cellId] = updatedCell;
        return next;
      });
      saveToIndexedDB(updatedCell, handleStorageError);
      setIsSearchDialogOpen(false);
      return;
    }

    try {
      const tempUpdatedCell: GameCell = {
        ...prevCell,
        name: game.name,
        image: originalImageUrl,
        imageObj: null,
      };
      setCells((prev) => {
        const next = [...prev];
        next[cellId] = tempUpdatedCell;
        return next;
      });

      setIsSearchDialogOpen(false);

      const blob = await loadFirstAvailableImage(imageSources);
      if (!blob) throw new Error("image_load_failed");

      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("image_load_timeout")), 15_000);
        img.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timer);
          reject(new Error("image_load_failed"));
        };
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法获取canvas上下文');

      const targetRatio = 3 / 4;
      const imgRatio = img.width / img.height;
      let cropWidth = img.width;
      let cropHeight = img.height;
      let cropX = 0;
      let cropY = 0;

      if (imgRatio > targetRatio) {
        cropWidth = img.height * targetRatio;
        cropX = (img.width - cropWidth) / 2;
      } else {
        cropHeight = img.width / targetRatio;
        cropY = (img.height - cropHeight) / 2;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const base64Url = canvas.toDataURL('image/jpeg', 0.9);
      URL.revokeObjectURL(objectUrl);

      const finalUpdatedCell: GameCell = {
        ...(cells[cellId] ?? prevCell),
        image: base64Url,
        name: game.name,
        imageObj: null,
      };
      setCells((prev) => {
        const next = [...prev];
        next[cellId] = finalUpdatedCell;
        return next;
      });
      saveToIndexedDB(finalUpdatedCell, handleStorageError);
    } catch (error) {
      logError("转换图片为base64时出错:", error);
      const fallbackCell: GameCell = {
        ...prevCell,
        image: imageSources[0] ?? originalImageUrl,
        name: game.name,
        imageObj: null,
      };
      setCells((prev) => {
        const next = [...prev];
        next[cellId] = fallbackCell;
        return next;
      });
      saveToIndexedDB(fallbackCell, handleStorageError);
    }
  };

  // 处理图片上传 - 打开裁剪对话框
  const handleImageUpload = async (file: File) => {
    if (selectedCellId === null) return;

    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_FILE_SIZE) {
      alert(t('error.file_too_large', { size: '3MB' }) || '图片文件过大，请上传小于3MB的图片');
      return;
    }

    try {
      const imageSrc = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to read image'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Invalid image format'));
        img.src = imageSrc;
      });

      setUploadedImageSrc(imageSrc);
      setIsSearchDialogOpen(false);

      setTimeout(() => {
        setIsCropDialogOpen(true);
      }, 100);
    } catch (error) {
      logError('读取上传图片失败:', error);
      alert(t('error.image_load_failed_select_another'));
    }
  };

  // 处理裁剪确认
  const handleCropConfirm = async (croppedImageBase64: string) => {
    if (selectedCellId === null) return;

    const cellId = selectedCellId;
    try {
      const updatedCell: GameCell = {
        ...(cells[cellId] ?? { id: cellId, title: "" }),
        image: croppedImageBase64,
        imageObj: null,
      };
      setCells((prev) => {
        const next = [...prev];
        next[cellId] = updatedCell;
        return next;
      });
      saveToIndexedDB(updatedCell, handleStorageError);
      setUploadedImageSrc(null);
    } catch (error) {
      logError('保存裁剪图片失败:', error);
    }
  };

  //处理tip中超链接
  const parseTextWithLinks = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part.split('\n').map((line, i, arr) => (
        <span key={`${index}-${i}`}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  // 键盘可访问性：方向键在格子间移动，Enter 打开搜索对话框
  const handleCanvasKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const total = rowCount;
    if (total === 0) return;

    const cols = config.gridCols;
    const current = keyboardFocusCellId ?? 0;
    const row = Math.floor(current / cols);
    const col = current % cols;
    let next = current;

    switch (event.key) {
      case "ArrowRight":
        next = col + 1 < cols ? current + 1 : current;
        break;
      case "ArrowLeft":
        next = col > 0 ? current - 1 : current;
        break;
      case "ArrowDown":
        next = current + cols < total ? current + cols : current;
        break;
      case "ArrowUp":
        next = row > 0 ? current - cols : current;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setSelectedCellId(current);
        setKeyboardFocusCellId(current);
        setIsSearchDialogOpen(true);
        return;
      default:
        return;
    }

    event.preventDefault();
    setKeyboardFocusCellId(next);
    setSelectedCellId(next);
  };

  const presetActive = isPresetSize(gridSize);
  const showCustomControls = customMode || !presetActive;
  const customRows = Array.from({ length: MAX_ROWS }, (_, i) => i + 1)
  const customCols = Array.from({ length: MAX_COLS }, (_, i) => i + 1)

  return (
    <>
      <div className="w-full">
        <div className="mx-auto mb-3 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-2 px-4">
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <span className="mr-0.5">{t('grid.size')}</span>
            {GRID_PRESETS.map((preset) => {
              const active =
                preset.rows === gridSize.rows && preset.cols === gridSize.cols
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => changeGridSize(preset)}
                  title={`${preset.hint}`}
                  aria-label={`${preset.label} (${preset.hint})`}
                  className={
                    "rounded-full border px-2.5 py-1 leading-none transition-colors " +
                    (active
                      ? "border-gray-800 text-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700")
                  }
                >
                  {preset.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={
                "rounded-full border px-2.5 py-1 leading-none transition-colors " +
                (!presetActive
                  ? "border-gray-800 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700")
              }
            >
              {t('grid.custom')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsExampleOpen(true)}
            className="text-xs text-gray-400 underline-offset-4 transition-colors hover:text-gray-600 hover:underline"
          >
            {t('grid.example')}
          </button>
        </div>

        {showCustomControls && (
          <div className="mx-auto mb-3 flex w-full max-w-[1200px] flex-wrap items-center gap-3 px-4 text-xs text-gray-500">
            <label className="flex items-center gap-1">
              {t('grid.rows')}
              <select
                value={gridSize.rows}
                onChange={(e) =>
                  changeGridSize({ ...gridSize, rows: Number(e.target.value) })
                }
                className="rounded border border-gray-200 bg-white px-1.5 py-1 text-gray-700 outline-none focus:border-gray-400"
              >
                {customRows.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1">
              {t('grid.cols')}
              <select
                value={gridSize.cols}
                onChange={(e) =>
                  changeGridSize({ ...gridSize, cols: Number(e.target.value) })
                }
                className="rounded border border-gray-200 bg-white px-1.5 py-1 text-gray-700 outline-none focus:border-gray-400"
              >
                {customCols.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <span>{t('grid.custom_hint')}</span>
          </div>
        )}

        {sizeReady ? (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="img"
            aria-label={String(t('a11y.grid_label'))}
            tabIndex={0}
            onKeyDown={handleCanvasKeyDown}
            onFocus={() => setKeyboardFocusCellId(selectedCellId ?? 0)}
            onBlur={() => setKeyboardFocusCellId(null)}
            className="mx-auto block cursor-pointer outline-none"
            style={{
              width: `${config.width * scale}px`,
              height: `${config.height * scale}px`,
            }}
          />
        ) : (
          <div
            className="mx-auto max-w-[1200px] animate-pulse rounded bg-gray-100"
            style={{ aspectRatio: `${config.width} / ${config.height}` }}
          />
        )}
      </div>

      <p className="mt-4 px-4 text-sm text-gray-500 break-words max-w-4xl mx-auto">
        {parseTextWithLinks(String(t('ui.tip_edit')))}
      </p>

      <Button
        onClick={() => generateImage(canvasRef, locale)}
        className="mt-6 px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 whitespace-normal text-center"
      >
        {t('ui.generate', { title: parseMainTitle(globalConfig.mainTitle).line1 })}
      </Button>

      <GameSearchDialog
        isOpen={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSelectGame={handleSelectGame}
        onUploadImage={handleImageUpload}
        onClearCell={handleClearCell}
      />

      <TextEditDialog
        isOpen={isTitleDialogOpen}
        onOpenChange={setIsTitleDialogOpen}
        title={String(t('dialog.edit_title'))}
        defaultValue={editingText}
        onSave={handleSaveTitle}
      />

      <TextEditDialog
        isOpen={isNameDialogOpen}
        onOpenChange={setIsNameDialogOpen}
        title={String(t('dialog.edit_game_name'))}
        defaultValue={editingText}
        onSave={handleSaveName}
      />

      <TextEditDialog
        isOpen={isMainTitleDialogOpen}
        onOpenChange={setIsMainTitleDialogOpen}
        title={String(t('dialog.edit_main_title'))}
        defaultValue={editingText}
        onSave={handleSaveMainTitle}
        multiline
        hint={String(t('dialog.main_title_hint'))}
      />

      <ImageCropDialog
        isOpen={isCropDialogOpen}
        onOpenChange={setIsCropDialogOpen}
        imageSrc={uploadedImageSrc}
        onConfirm={handleCropConfirm}
      />

      <Dialog open={isExampleOpen} onOpenChange={setIsExampleOpen}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('grid.example')}</DialogTitle>
          </DialogHeader>
          <NextImage
            src="/example.webp"
            alt={String(t('grid.example'))}
            width={1600}
            height={1733}
            unoptimized
            className="h-auto w-full rounded"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
