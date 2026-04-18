export interface ScrapeResult {
  views: number;
  success: boolean;
  error?: string;
}

export type Platform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE";

/** Interface commune pour les scrapers par plateforme. */
export interface PlatformScraper {
  scrape(videoUrl: string): Promise<ScrapeResult>;
}

/** Clés fréquentes dans les JSON TikTok / Instagram (APIs tierces). */
const VIEW_COUNT_KEYS = [
  "playCount",
  "play_count",
  "view_count",
  "videoViewCount",
  "video_play_count",
  "views",
  "viewCount",
  "ig_play_count",
] as const;

function findViewsInJson(obj: unknown, depth = 0): number | null {
  if (depth > 14 || obj === null || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  for (const k of VIEW_COUNT_KEYS) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.floor(v);
    if (typeof v === "string" && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  }
  for (const v of Object.values(o)) {
    const n = findViewsInJson(v, depth + 1);
    if (n != null) return n;
  }
  return null;
}

async function fetchRapidApiVideoStats(opts: {
  videoUrl: string;
  envKey: string;
  envHost: string;
  defaultPath: string;
  defaultQueryParam: string;
  label: string;
}): Promise<ScrapeResult> {
  const key = process.env[opts.envKey];
  const host = process.env[opts.envHost];
  if (!key?.trim() || !host?.trim()) {
    return {
      views: 0,
      success: false,
      error: `${opts.label} : définir ${opts.envKey} et ${opts.envHost} (clé + host RapidAPI).`,
    };
  }
  const prefix = opts.envKey.replace(/_KEY$/, "");
  const pathOverride = process.env[`${prefix}_PATH`];
  const path = (pathOverride ?? opts.defaultPath).trim() || opts.defaultPath;
  const param =
    process.env[`${prefix}_QUERY_PARAM`]?.trim() ?? opts.defaultQueryParam;
  const baseHost = host.replace(/^https?:\/\//, "").split("/")[0];
  const pathNorm = path.startsWith("/") ? path : `/${path}`;
  const url = `https://${baseHost}${pathNorm}?${param}=${encodeURIComponent(opts.videoUrl)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key.trim(),
        "X-RapidAPI-Host": baseHost,
      },
    });
    if (!res.ok) {
      return { views: 0, success: false, error: `${opts.label} RapidAPI HTTP ${res.status}` };
    }
    const data: unknown = await res.json();
    const views = findViewsInJson(data);
    if (views === null) {
      return {
        views: 0,
        success: false,
        error: `${opts.label} : impossible de lire le nombre de vues dans la réponse (adapter les clés ou TIKTOK_RAPIDAPI_PATH / INSTAGRAM_RAPIDAPI_PATH).`,
      };
    }
    return { views, success: true };
  } catch (e) {
    return { views: 0, success: false, error: `${opts.label} : ${String(e)}` };
  }
}

export class YouTubeScraper implements PlatformScraper {
  async scrape(videoUrl: string): Promise<ScrapeResult> {
    try {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) {
        return { views: 0, success: false, error: "YOUTUBE_API_KEY manquant" };
      }
      const id = extractYoutubeVideoId(videoUrl);
      if (!id) {
        return { views: 0, success: false, error: "ID vidéo YouTube introuvable" };
      }
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(id)}&part=statistics&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { views: 0, success: false, error: `YouTube API ${res.status}` };
      }
      const data = (await res.json()) as {
        items?: Array<{ statistics?: { viewCount?: string } }>;
      };
      const raw = data.items?.[0]?.statistics?.viewCount;
      const views = raw ? parseInt(raw, 10) : 0;
      return { views: Number.isFinite(views) ? views : 0, success: true };
    } catch (e) {
      return { views: 0, success: false, error: String(e) };
    }
  }
}

function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * TikTok via RapidAPI (ex. endpoint « video info » avec `video_url`).
 * Variables : TIKTOK_RAPIDAPI_KEY, TIKTOK_RAPIDAPI_HOST ; optionnel : TIKTOK_RAPIDAPI_PATH, TIKTOK_RAPIDAPI_QUERY_PARAM.
 */
export class TikTokScraper implements PlatformScraper {
  async scrape(videoUrl: string): Promise<ScrapeResult> {
    return fetchRapidApiVideoStats({
      videoUrl,
      envKey: "TIKTOK_RAPIDAPI_KEY",
      envHost: "TIKTOK_RAPIDAPI_HOST",
      defaultPath: "/api/video/info",
      defaultQueryParam: "video_url",
      label: "TikTok",
    });
  }
}

/**
 * Instagram (reel / post) via RapidAPI.
 * Variables : INSTAGRAM_RAPIDAPI_KEY, INSTAGRAM_RAPIDAPI_HOST ; optionnel : INSTAGRAM_RAPIDAPI_PATH, INSTAGRAM_RAPIDAPI_QUERY_PARAM.
 * Le path par défaut est un placeholder : à aligner sur l’API RapidAPI choisie (ex. `/reel`, `/media`, etc.).
 */
export class InstagramScraper implements PlatformScraper {
  async scrape(videoUrl: string): Promise<ScrapeResult> {
    return fetchRapidApiVideoStats({
      videoUrl,
      envKey: "INSTAGRAM_RAPIDAPI_KEY",
      envHost: "INSTAGRAM_RAPIDAPI_HOST",
      defaultPath: "/api/instagram/media",
      defaultQueryParam: "url",
      label: "Instagram",
    });
  }
}

export function getScraperForPlatform(platform: Platform): PlatformScraper {
  switch (platform) {
    case "YOUTUBE":
      return new YouTubeScraper();
    case "TIKTOK":
      return new TikTokScraper();
    case "INSTAGRAM":
      return new InstagramScraper();
    default:
      throw new Error(`Plateforme non supportée: ${platform}`);
  }
}

export async function scrapeViews(videoUrl: string, platform: Platform): Promise<ScrapeResult> {
  return getScraperForPlatform(platform).scrape(videoUrl);
}
