/**
 * 极简内存限流器（按客户端 IP 固定窗口计数）。
 * 说明：Vercel 每个 serverless 实例各有内存，属于「尽力而为」的防刷，
 * 主要用于挡掉单实例上的循环请求；如需要严格全局限流应改用 KV/Redis。
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 5000;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/** 清理过期桶，防止 Map 无限增长。 */
function sweep(now: number): void {
  if (buckets.size <= MAX_ENTRIES) return;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
  if (buckets.size > MAX_ENTRIES) buckets.clear();
}

export interface RateLimitResult {
  ok: boolean;
  /** 超限时距离窗口重置的秒数（用于 Retry-After）。 */
  retryAfter: number;
}

/**
 * @param request 请求对象
 * @param key     限流维度前缀（不同路由使用不同 key）
 * @param limit   窗口内允许的请求数
 * @param windowMs 窗口长度（毫秒）
 */
export function rateLimit(
  request: Request,
  key: string,
  limit = 30,
  windowMs = 60_000
): RateLimitResult {
  const ip = getClientIp(request);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** 构造统一的 429 响应。 */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    }
  );
}
