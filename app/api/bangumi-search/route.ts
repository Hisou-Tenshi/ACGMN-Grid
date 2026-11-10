import { NextResponse } from "next/server";
import { log, warn, error as logError } from "@/lib/logger";
import { getCached, setCached } from "@/lib/server/cache";
import { rateLimit, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BANGUMI_API_BASE_URL = "https://api.bgm.tv";
const BANGUMI_ACCESS_TOKEN = process.env.BANGUMI_ACCESS_TOKEN;
const BANGUMI_USER_AGENT = process.env.BANGUMI_USER_AGENT;

const SEARCH_CACHE_TTL = 2 * 60 * 1000;
const MAX_RESULTS = 10;

// Bangumi条目类型定义
interface BangumiSubject {
  id: number;
  name: string;
  type?: number; // 1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元
  images?: {
    large?: string;
    common?: string;
  };
  image?: string;
}

interface BangumiV0Subject {
  id: number;
  name: string;
  name_cn?: string;
  type?: number;
  images?: {
    large?: string;
    common?: string;
    medium?: string;
  };
}

interface BangumiV0SearchResponse {
  data?: BangumiV0Subject[];
}

interface BangumiLegacySearchResponse {
  list?: BangumiSubject[];
}

function bangumiHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "User-Agent": BANGUMI_USER_AGENT || "GameGrid/1.0",
    Accept: "application/json",
    ...(BANGUMI_ACCESS_TOKEN ? { Authorization: `Bearer ${BANGUMI_ACCESS_TOKEN}` } : {}),
    ...extra,
  };
}

/** 把外部 AbortSignal 与超时合并成一个信号。 */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("Timeout", "TimeoutError"));
  }, timeoutMs);

  const abortFromParent = () => {
    clearTimeout(timer);
    controller.abort(signal?.reason);
  };

  if (signal) {
    if (signal.aborted) abortFromParent();
    else signal.addEventListener("abort", abortFromParent, { once: true });
  }

  controller.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
  return controller.signal;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1,
  timeout = 8_000
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, {
        ...options,
        signal: withTimeout(options.signal ?? undefined, timeout),
      });
    } catch (err) {
      lastError = err;
      if ((err as Error).name === "AbortError") throw err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}

function pickImage(data: {
  images?: { large?: string; common?: string; medium?: string };
  image?: string;
}): string | null {
  return data.images?.large || data.images?.common || data.images?.medium || data.image || null;
}

/**
 * 优先官方新版 /v0/search/subjects（一次请求即带封面），
 * 不可用时再回退旧版 /search/subject。
 */
async function searchSubjects(query: string, signal?: AbortSignal): Promise<BangumiSubject[]> {
  const cacheKey = `bgm:search:${query.toLowerCase()}`;
  const cached = getCached<BangumiSubject[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetchWithRetry(
      `${BANGUMI_API_BASE_URL}/v0/search/subjects`,
      {
        method: "POST",
        headers: bangumiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          keyword: query,
          sort: "match",
          filter: { type: [1, 2, 3, 4, 6] },
        }),
        signal,
      },
      1,
      6_000
    );

    if (response.ok) {
      const data = (await response.json()) as BangumiV0SearchResponse;
      const list = Array.isArray(data.data) ? data.data : [];
      if (list.length > 0) {
        const results: BangumiSubject[] = list.map((item) => ({
          id: item.id,
          name: item.name_cn || item.name,
          type: item.type,
          images: item.images,
        }));
        setCached(cacheKey, results, SEARCH_CACHE_TTL);
        return results;
      }
      // 官方接口可用但无结果：直接返回空，不再请求旧接口
      setCached(cacheKey, [], SEARCH_CACHE_TTL);
      return [];
    }

    warn(`Bangumi v0 搜索失败，回退旧接口: ${response.status}`);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    warn("Bangumi v0 搜索异常，回退旧接口", err);
  }

  const legacyUrl = `${BANGUMI_API_BASE_URL}/search/subject/${encodeURIComponent(
    query
  )}?responseGroup=small`;
  const legacyResponse = await fetchWithRetry(
    legacyUrl,
    { headers: bangumiHeaders(), signal },
    1,
    6_000
  );

  if (!legacyResponse.ok) {
    throw new Error(`Bangumi API error: ${legacyResponse.status}`);
  }

  const legacyData = (await legacyResponse.json()) as BangumiLegacySearchResponse;
  const list = Array.isArray(legacyData.list) ? legacyData.list : [];
  setCached(cacheKey, list, SEARCH_CACHE_TTL);
  return list;
}

/** 旧接口列表无封面时，单独补一次详情（新版 /v0 优先，再回退旧版）。 */
async function fetchCover(subject: BangumiSubject, signal?: AbortSignal): Promise<string | null> {
  try {
    const detailResponse = await fetchWithRetry(
      `${BANGUMI_API_BASE_URL}/v0/subjects/${subject.id}`,
      { headers: bangumiHeaders(), signal },
      0,
      5_000
    );
    if (detailResponse.ok) {
      const detail = (await detailResponse.json()) as BangumiV0Subject;
      const image = pickImage(detail);
      if (image) return image;
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    warn("获取 Bangumi 条目详情失败", subject.id, err);
  }

  try {
    const legacyResponse = await fetchWithRetry(
      `${BANGUMI_API_BASE_URL}/subject/${subject.id}`,
      { headers: bangumiHeaders(), signal },
      0,
      5_000
    );
    if (legacyResponse.ok) {
      const legacy = (await legacyResponse.json()) as BangumiV0Subject;
      return pickImage(legacy);
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    warn("获取 Bangumi 旧版条目详情失败", subject.id, err);
  }

  return null;
}

async function processSubject(
  subject: BangumiSubject,
  signal: AbortSignal,
  send: (payload: Record<string, unknown>) => void
): Promise<boolean> {
  try {
    const name = subject.name.replaceAll("&amp;", "&");

    send({
      type: "gameStart",
      game: { id: subject.id, name, image: null, subjectType: subject.type },
    });

    let image = pickImage(subject);
    if (!image) {
      image = await fetchCover(subject, signal);
    }

    send({
      type: "gameComplete",
      game: { id: subject.id, name, image, subjectType: subject.type },
    });

    return Boolean(image);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    logError("处理 Bangumi 条目失败", subject.id, err);
    send({ type: "gameError", gameId: subject.id, error: "get_subject_failed" });
    return false;
  }
}

export async function GET(request: Request) {
  const limit = rateLimit(request, "bgm-search", 30, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "搜索词不能为空" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const signal = request.signal;

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (payload: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
        } catch {
          closed = true;
        }
      };

      try {
        log(`开始在Bangumi搜索: "${query}"`);
        const subjects = await searchSubjects(query, signal);

        if (subjects.length === 0) {
          send({ type: "end", successCount: 0 });
          return;
        }

        const results = subjects.slice(0, MAX_RESULTS);
        send({ type: "init", total: results.length });

        const batchSize = 2;
        let successCount = 0;

        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);
          const flags = await Promise.all(
            batch.map((subject) => processSubject(subject, signal, send))
          );
          successCount += flags.filter(Boolean).length;

          if (i + batchSize < results.length) {
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }

        send({ type: "end", successCount });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          log("搜索请求被取消");
          return;
        }
        logError("Bangumi 搜索失败", err);
        send({ type: "error", message: "search_failed" });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // 流可能已被取消
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
