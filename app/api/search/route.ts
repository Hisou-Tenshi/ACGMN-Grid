import { NextResponse } from "next/server";
import { log, warn, error as logError } from "@/lib/logger";
import { getCached, setCached } from "@/lib/server/cache";
import { rateLimit, tooManyRequests } from "@/lib/server/rateLimit";

// 这里需要在Vercel上设置STEAMGRIDDB_API_KEY环境变量
const STEAMGRIDDB_API_KEY = process.env.STEAMGRIDDB_API_KEY;

const SEARCH_CACHE_TTL = 5 * 60 * 1000;
const MAX_RESULTS = 10;

interface SteamGridGame {
  id: number;
  name: string;
}

interface SteamGridGridData {
  url?: string;
  thumb?: string;
}

interface SteamGridSearchResponse {
  data?: SteamGridGame[];
}

interface SteamGridGridsResponse {
  data?: SteamGridGridData[];
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

/** 带超时与重试的 fetch（AbortError 不重试，直接抛出）。 */
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

async function fetchAutocomplete(query: string, signal?: AbortSignal): Promise<SteamGridGame[]> {
  const cacheKey = `sgdb:search:${query.toLowerCase()}`;
  const cached = getCached<SteamGridGame[]>(cacheKey);
  if (cached) return cached;

  const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(query)}`;
  const response = await fetchWithRetry(
    searchUrl,
    {
      headers: {
        Authorization: `Bearer ${STEAMGRIDDB_API_KEY}`,
        "User-Agent": "GameGrid/1.0",
        Accept: "application/json",
      },
      signal,
    },
    2,
    6_000
  );

  if (!response.ok) {
    throw new Error(`SteamGridDB API error: ${response.status}`);
  }

  const data = (await response.json()) as SteamGridSearchResponse;
  const games = Array.isArray(data.data) ? data.data : [];
  setCached(cacheKey, games, SEARCH_CACHE_TTL);
  return games;
}

async function findCover(
  game: SteamGridGame,
  signal?: AbortSignal
): Promise<{ image: string | null; thumbnail: string | null }> {
  const imageFormats = [
    `https://www.steamgriddb.com/api/v2/grids/game/${game.id}?dimensions=600x900&styles=alternate,blurred,material,white_logo&types=static&nsfw=false&humor=any&limit=10`,
    `https://www.steamgriddb.com/api/v2/grids/game/${game.id}?dimensions=342x482&styles=alternate,blurred,material,white_logo&types=static&nsfw=false&limit=10`,
    `https://www.steamgriddb.com/api/v2/grids/game/${game.id}?styles=alternate,blurred,material,white_logo&types=static&nsfw=false&limit=10`,
  ];

  for (const formatUrl of imageFormats) {
    try {
      const response = await fetchWithRetry(
        formatUrl,
        {
          headers: { Authorization: `Bearer ${STEAMGRIDDB_API_KEY}` },
          signal,
        },
        0,
        5_000
      );

      if (!response.ok) continue;

      const data = (await response.json()) as SteamGridGridsResponse;
      const first = data.data?.[0];
      if (first?.url) {
        return {
          image: first.url,
          thumbnail: typeof first.thumb === "string" ? first.thumb : null,
        };
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      warn("获取 SteamGridDB 封面失败", err);
    }
  }

  return { image: null, thumbnail: null };
}

async function processGame(
  game: SteamGridGame,
  signal: AbortSignal,
  send: (payload: Record<string, unknown>) => void
): Promise<boolean> {
  try {
    send({
      type: "gameStart",
      game: { id: game.id, name: game.name, image: null },
    });

    const { image, thumbnail } = await findCover(game, signal);

    send({
      type: "gameComplete",
      game: { id: game.id, name: game.name, image, thumbnail },
    });

    return Boolean(image);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    logError("处理游戏失败", game.id, err);
    send({ type: "gameError", gameId: game.id, error: "get_game_failed" });
    return false;
  }
}

export async function GET(request: Request) {
  const limit = rateLimit(request, "sgdb-search", 20, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "搜索词不能为空" }, { status: 400 });
  }

  if (!STEAMGRIDDB_API_KEY) {
    return new Response(
      JSON.stringify({ type: "error", message: "missing_api_key" }),
      { headers: { "Content-Type": "application/json" } }
    );
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
        log(`开始搜索游戏: "${query}"`);
        const games = await fetchAutocomplete(query, signal);

        if (games.length === 0) {
          send({ type: "end", successCount: 0 });
          return;
        }

        const results = games.slice(0, MAX_RESULTS);
        send({ type: "init", total: results.length });

        const batchSize = 3;
        let successCount = 0;

        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);
          const flags = await Promise.all(
            batch.map((game) => processGame(game, signal, send))
          );
          successCount += flags.filter(Boolean).length;

          if (i + batchSize < results.length) {
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
        }

        send({ type: "end", successCount });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          log("搜索请求被取消");
          return;
        }
        logError("搜索游戏失败", err);
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
      "Cache-Control": "no-store",
    },
  });
}
