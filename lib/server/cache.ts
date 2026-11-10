/**
 * 极简 TTL 内存缓存：用于搜索结果等「短时间重复请求」，
 * 降低对上游 API（SteamGridDB / Bangumi）的调用量。
 * 与限流器一样是单实例内存缓存，只作优化，不是强一致存储。
 */
interface Entry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, Entry>();
const MAX_ENTRIES = 1000;

function sweep(now: number): void {
  if (store.size <= MAX_ENTRIES) return;
  store.forEach((entry, key) => {
    if (entry.expiresAt <= now) store.delete(key);
  });
  if (store.size > MAX_ENTRIES) store.clear();
}

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  const now = Date.now();
  sweep(now);
  store.set(key, { value, expiresAt: now + ttlMs });
}

/**
 * 读取缓存，未命中时执行 loader 并写回。
 * 注意：并发未命中时会有多个 loader 同时执行，属于可接受的取舍。
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== undefined) return hit;
  const value = await loader();
  setCached(key, value, ttlMs);
  return value;
}
