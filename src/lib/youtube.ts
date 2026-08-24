import type { SearchCandidate, SearchResult } from "./types";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

interface YouTubeSearchItem {
  id: { kind: string; videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
  };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: { duration: string };
}

function parseIsoDuration(duration: string): number {
  const match = duration.match(
    /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match;
  return (
    (Number(days ?? 0) * 86400) +
    (Number(hours ?? 0) * 3600) +
    (Number(minutes ?? 0) * 60) +
    Number(seconds ?? 0)
  );
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

export async function searchYouTube(query: string): Promise<SearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      items: [],
      demo: true,
      message:
        "YOUTUBE_API_KEY is not set. Set it in .env.local to enable real YouTube search.",
    };
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "12",
    q: query,
    videoCategoryId: "10",
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      items: [],
      message: `YouTube search failed (${res.status}). Check your API key and quota.`,
    };
  }

  const data = (await res.json()) as { items?: YouTubeSearchItem[] };
  const items = data.items ?? [];
  const videoIds = items
    .map((i) => i.id.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) {
    return { items: [] };
  }

  const videoParams = new URLSearchParams({
    part: "contentDetails",
    id: videoIds.join(","),
    key: apiKey,
  });

  const videoRes = await fetch(`${YOUTUBE_VIDEO_URL}?${videoParams.toString()}`, {
    cache: "no-store",
  });

  const durationById = new Map<string, number>();
  if (videoRes.ok) {
    const videoData = (await videoRes.json()) as { items?: YouTubeVideoItem[] };
    for (const v of videoData.items ?? []) {
      durationById.set(v.id, parseIsoDuration(v.contentDetails.duration));
    }
  }

  const results: SearchCandidate[] = items.map((item) => ({
    videoId: item.id.videoId as string,
    title: cleanTitle(item.snippet.title),
    artist: item.snippet.channelTitle,
    durationSeconds: durationById.get(item.id.videoId as string) ?? 0,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.high?.url ?? "",
  }));

  return { items: results };
}
