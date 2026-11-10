const BANGUMI_IMAGE_PROXY_ORIGIN = "https://bgm-pic.shatranj.space";
const BANGUMI_IMAGE_LEGACY_PROXY = "https://my9.shatranj.space/api/image/bgm";
const BANGUMI_IMAGE_HOSTS = new Set(["lain.bgm.tv", "img.bgm.tv"]);
const STEAMGRIDDB_IMAGE_HOSTS = new Set(["cdn2.steamgriddb.com"]);

function normalizeUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const normalized = raw.startsWith("//") ? `https:${raw}` : raw;

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    parsed.protocol = "https:";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * 搜索列表预览的候选图片地址，按「官方直连 → 代理」的顺序排列。
 * 预览不经过 canvas，允许直接加载官方图片；加载失败时由 onError 切到代理。
 */
export function getSearchImageSources(
  image: string | null | undefined,
  thumbnail?: string | null,
): string[] {
  const originalProxy = toProxiedBangumiImageUrl(image);
  if (!originalProxy) return [];

  const toSteamGridUrl = (value: string | null | undefined): string | null => {
    if (!value) return null;
    try {
      const url = new URL(value.trim().replace(/^\/\//, "https://"));
      if (!STEAMGRIDDB_IMAGE_HOSTS.has(url.hostname.toLowerCase()) ||
          (url.protocol !== "https:" && url.protocol !== "http:")) return null;
      url.protocol = "https:";
      url.hash = "";
      return url.toString();
    } catch {
      return null;
    }
  };

  const directOriginal = toSteamGridUrl(image);
  if (!directOriginal) {
    // Bangumi 等：先试官方原图，再回退代理
    const official = normalizeUrl(image || "");
    const sources = official ? [official, originalProxy] : [originalProxy];
    return Array.from(new Set(sources.filter((source): source is string => Boolean(source))));
  }

  const directThumbnail = toSteamGridUrl(thumbnail);
  const sources = directThumbnail
    ? [directThumbnail, toProxiedBangumiImageUrl(directThumbnail), originalProxy]
    : [directOriginal, originalProxy];

  return Array.from(new Set(sources.filter((source): source is string => Boolean(source))));
}

/**
 * 选中封面后写入 canvas 的候选地址：官方直连优先，CORS/网络失败再走代理。
 * 调用方按顺序尝试，第一个成功加载的地址会被使用。
 */
export function getSelectImageSources(value: string | null | undefined): string[] {
  if (!value) return [];

  const normalized = normalizeUrl(value);
  if (!normalized) return [];

  if (normalized.startsWith("data:") || normalized.startsWith("blob:") || normalized.startsWith("/")) {
    return [normalized];
  }

  // 写入 canvas 需要把图片转成 base64，跨域 fetch 会被 CORS 拦截，
  // 因此这里优先走本站 /api/proxy（服务端直连官方地址，仍属官方优先），
  // 代理不可用时再回退到 bgm-pic / SteamGridDB 专用代理。
  const sameOriginProxy = `/api/proxy?url=${encodeURIComponent(normalized)}`;
  const legacyProxy = toProxiedBangumiImageUrl(normalized);
  const sources = [sameOriginProxy, legacyProxy];

  return Array.from(new Set(sources.filter((source): source is string => Boolean(source))));
}

export function toProxiedBangumiImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalized = normalizeUrl(value);
  if (!normalized) return null;

  if (normalized.startsWith("data:") || normalized.startsWith("blob:") || normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);

    if (STEAMGRIDDB_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) {
      return `/api/proxy?url=${encodeURIComponent(parsed.toString())}`;
    }

    if (!BANGUMI_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) {
      return normalized;
    }

    if (parsed.pathname.startsWith("/pic/") && !parsed.search) {
      const source = parsed.hostname.toLowerCase() === "lain.bgm.tv" ? "lain" : "img";
      return `${BANGUMI_IMAGE_PROXY_ORIGIN}/${source}${parsed.pathname}`;
    }
    return `${BANGUMI_IMAGE_LEGACY_PROXY}?url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return normalized;
  }
}
