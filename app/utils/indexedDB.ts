import { isBrowser, DB_CONFIG } from "../constants";
import { log, error as logError } from "@/lib/logger"
import { GameCell } from "../types";

export type PersistErrorReason = "quota" | "unknown";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = (event) => {
        logError("IndexedDB error:", event);
        resolve(null);
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // 版本变更（其他标签页升级）时主动关闭，避免阻塞升级
        db.onversionchange = () => db.close();
        db.onclose = () => {
          dbPromise = null;
        };
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
          db.createObjectStore(DB_CONFIG.storeName, { keyPath: "id" });
        }
      };
    } catch (error) {
      logError("初始化IndexedDB失败:", error);
      resolve(null);
    }
  });
}

/**
 * 初始化IndexedDB（复用同一个连接，不再每次读写都重新 open）。
 */
export function initDB(): Promise<IDBDatabase | null> {
  if (!isBrowser) return Promise.resolve(null);

  if (!window.indexedDB) {
    logError("您的浏览器不支持IndexedDB，无法保存数据");
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = openDB();
  }
  return dbPromise;
}

function classifyError(error: unknown): PersistErrorReason {
  const name = (error as { name?: string } | null)?.name;
  return name === "QuotaExceededError" ? "quota" : "unknown";
}

/**
 * 保存单元格数据到IndexedDB。
 * onError 用于把配额不足等失败原因反馈给 UI（可选）。
 */
export async function saveToIndexedDB(
  cell: GameCell,
  onError?: (reason: PersistErrorReason) => void
): Promise<void> {
  if (!isBrowser) return;

  try {
    const db = await initDB();
    if (!db) {
      onError?.("unknown");
      return;
    }

    const transaction = db.transaction(DB_CONFIG.storeName, "readwrite");
    const store = transaction.objectStore(DB_CONFIG.storeName);

    // 只保存必要的数据，不保存imageObj
    const cellData: Record<string, unknown> = { ...cell };
    delete cellData.imageObj;
    store.put(cellData);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        log("数据保存成功");
        resolve();
      };

      transaction.onerror = (event) => {
        logError("保存数据失败:", event);
        reject((event.target as IDBRequest | null)?.error ?? event);
      };

      transaction.onabort = () => {
        reject(transaction.error ?? new Error("transaction_aborted"));
      };
    });
  } catch (error) {
    logError("保存数据失败:", error);
    onError?.(classifyError(error));
  }
}

/**
 * 从IndexedDB加载所有单元格数据
 */
export async function loadCellsFromDB(): Promise<GameCell[]> {
  try {
    const db = await initDB();
    if (!db) return [];

    const transaction = db.transaction(DB_CONFIG.storeName, "readonly");
    const store = transaction.objectStore(DB_CONFIG.storeName);

    return await new Promise<GameCell[]>((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        logError("加载数据失败:", event);
        reject([]);
      };
    });
  } catch (error) {
    logError("加载数据失败:", error);
    return [];
  }
}
