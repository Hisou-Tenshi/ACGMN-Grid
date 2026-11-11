import { CanvasConfig, DBConfig } from "../types";

/**
 * 检查是否在浏览器环境中
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Canvas配置
 * 使用2倍分辨率以提高导出图片的清晰度
 */
export const CANVAS_CONFIG: CanvasConfig = {
  width: 2400,  
  height: 2600, 
  padding: 80,  
  titleHeight: 100, 
  gridRows: 4,
  gridCols: 6,
  cellPadding: 20, 
  cellBorderWidth: 4, 
  cellBorderRadius: 16, 
  cellAspectRatio: 0.75, // 宽高比为3:4
  coverRatio: 0.75, // 封面宽高比为3:4
  titleFontSize: 96, 
  cellTitleFontSize: 44, 
  cellNameFontSize: 28, 
  cellTitleMargin: 12, 
  cellNameMargin: 12, 
};

/**
 * IndexedDB 配置
 */
export const DB_CONFIG: DBConfig = {
  name: "gamePreferenceDB",
  storeName: "gameData",
  version: 1
};

/**
 * 9 格 / 16 格的默认标题（英文兜底）
 * 其他语系在 messages/*.ts 里提供同名数组；缺省时回退到这两份。
 */
export const FALLBACK_CELL_TITLES_9: string[] = [
  "Gateway",
  "Favorite",
  "Must Recommend",
  "Most Fun",
  "Most Moving",
  "Guilty Pleasure",
  "Longest Companion",
  "Best Story",
  "Most Disliked",
];

export const FALLBACK_CELL_TITLES_16: string[] = [
  "Gateway",
  "Favorite",
  "Must Recommend",
  "Longest Companion",
  "Most Fun",
  "Most Moving",
  "Guilty Pleasure",
  "Best Story",
  "Most Awaited Sequel",
  "Longest Backlog",
  "Nostalgia Trip",
  "Wish I Watched Sooner",
  "Underrated Gem",
  "Most Disliked",
  "Overrated",
  "Most Hated",
];


// 添加 Canvas.roundRect polyfill，以兼容旧版浏览器
interface BorderRadius {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

if (isBrowser && !CanvasRenderingContext2D.prototype.roundRect) {
  const toRadius = (value: number | DOMPointInit | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return value.x ?? value.y ?? 0;
  };

  CanvasRenderingContext2D.prototype.roundRect = function (
    x: number,
    y: number,
    width: number,
    height: number,
    radii?: number | DOMPointInit | (number | DOMPointInit)[]
  ) {
    let r: BorderRadius;
    if (typeof radii === 'number') {
      r = { tl: radii, tr: radii, br: radii, bl: radii };
    } else if (Array.isArray(radii)) {
      r = {
        tl: toRadius(radii[0]),
        tr: toRadius(radii[1]),
        br: toRadius(radii[2]),
        bl: toRadius(radii[3]),
      };
    } else if (radii) {
      const radius = toRadius(radii);
      r = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      r = { tl: 0, tr: 0, br: 0, bl: 0 };
    }

    this.beginPath();
    this.moveTo(x + r.tl, y);
    this.lineTo(x + width - r.tr, y);
    this.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    this.lineTo(x + width, y + height - r.br);
    this.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    this.lineTo(x + r.bl, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    this.lineTo(x, y + r.tl);
    this.quadraticCurveTo(x, y, x + r.tl, y);
    this.closePath();
    return this;
  };
}
