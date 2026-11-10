// app/api/proxy/route.ts
import { NextResponse } from "next/server";

const BANGUMI_USER_AGENT = process.env.BANGUMI_USER_AGENT;

/**
 * 仅允许代理这些图片站点，防止把 /api/proxy 变成任意 URL 转发器（SSRF）。
 * 使用「主机名等于 suffix 或以 .suffix 结尾」匹配，避免 evilbgm.tv 之类绕过。
 */
const ALLOWED_HOST_SUFFIXES = [
  "bgm.tv",
  "steamgriddb.com",
  "steamstatic.com",
  "igdb.com",
  "shatranj.space",
  "wsrv.nl",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_REDIRECTS = 3;

function isHostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

function parseTarget(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (!isHostAllowed(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function imageHeaders(target: URL): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": BANGUMI_USER_AGENT || "GameGrid/1.0",
    Accept: "image/*",
  };
  if (target.hostname.endsWith("bgm.tv")) {
    headers.Referer = "https://bgm.tv/";
  }
  return headers;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  let target = parseTarget(imageUrl);
  if (!target) {
    return new NextResponse("URL not allowed", { status: 403 });
  }

  try {
    let response: Response | null = null;

    // 手动跟随重定向，逐跳校验目标主机，避免被重定向到内网/云元数据地址。
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const current = target;
      if (!current) break;

      const res = await fetch(current.toString(), {
        headers: imageHeaders(current),
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        target = parseTarget(new URL(location, current).toString());
        if (!target) {
          return new NextResponse("Redirect target not allowed", { status: 403 });
        }
        continue;
      }

      response = res;
      break;
    }

    if (!response) {
      return new NextResponse("Too many redirects", { status: 502 });
    }

    if (!response.ok || !response.body) {
      return new NextResponse("Upstream error", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Unsupported content type", { status: 415 });
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return new NextResponse("Image too large", { status: 413 });
      }
      chunks.push(value);
    }

    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch {
    // 不把内部错误信息回传给客户端
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
