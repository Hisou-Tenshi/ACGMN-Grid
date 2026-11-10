import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { rateLimit, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string): boolean {
  const value = address.toLowerCase();
  if (value === "::1" || value === "::") return true;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb")) {
    return true;
  }
  // IPv4-mapped IPv6
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

/** 解析域名并拒绝内网/回环地址，防止通过链接下载触发 SSRF。 */
async function assertPublicHost(hostname: string): Promise<boolean> {
  const addresses = await lookup(hostname, { all: true });
  if (addresses.length === 0) return false;
  return addresses.every(({ address, family }) =>
    family === 6 ? !isPrivateIpv6(address) : !isPrivateIpv4(address)
  );
}

function parseTarget(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const limit = rateLimit(request, "link-image", 20, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) return new NextResponse("Missing URL parameter", { status: 400 });

  let target = parseTarget(rawUrl);
  if (!target) return new NextResponse("URL not allowed", { status: 403 });

  try {
    let response: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const current = target;
      if (!current) break;

      if (!(await assertPublicHost(current.hostname))) {
        return new NextResponse("URL not allowed", { status: 403 });
      }

      const res = await fetch(current.toString(), {
        headers: { "User-Agent": "GameGrid/1.0", Accept: "image/*" },
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
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

    if (!response) return new NextResponse("Too many redirects", { status: 502 });
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
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
