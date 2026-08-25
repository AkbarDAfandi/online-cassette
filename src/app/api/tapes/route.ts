import { NextResponse } from "next/server";
import { createMixtape } from "@/lib/db";
import type { Side, Track } from "@/lib/types";

const MAX_TRACKS = 10;
const MAX_PER_SIDE = 5;

interface SaveBody {
  title: string;
  note?: string;
  tracks: Omit<Track, "order">[];
}

function isValidSide(value: unknown): value is Side {
  return value === "A" || value === "B";
}

export async function POST(request: Request) {
  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const tracks = Array.isArray(body.tracks) ? body.tracks : [];

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (tracks.length === 0) {
    return NextResponse.json({ error: "Add at least one track" }, { status: 400 });
  }
  if (tracks.length > MAX_TRACKS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_TRACKS} tracks` },
      { status: 400 }
    );
  }

  const sideACount = tracks.filter((t) => t.side === "A").length;
  const sideBCount = tracks.filter((t) => t.side === "B").length;
  if (sideACount > MAX_PER_SIDE || sideBCount > MAX_PER_SIDE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PER_SIDE} tracks per side` },
      { status: 400 }
    );
  }

  for (const t of tracks) {
    if (
      !t ||
      typeof t.videoId !== "string" ||
      !t.videoId ||
      typeof t.title !== "string" ||
      !t.title ||
      !isValidSide(t.side)
    ) {
      return NextResponse.json({ error: "Invalid track" }, { status: 400 });
    }
  }

  const normalizedTracks: Omit<Track, "order">[] = tracks.map((t) => ({
    side: t.side,
    videoId: t.videoId,
    title: String(t.title).trim(),
    artist: typeof t.artist === "string" ? t.artist : "",
    durationSeconds:
      typeof t.durationSeconds === "number" && t.durationSeconds >= 0
        ? Math.floor(t.durationSeconds)
        : 0,
    thumbnailUrl: typeof t.thumbnailUrl === "string" ? t.thumbnailUrl : "",
  }));

  let mixtape;
  try {
    mixtape = await createMixtape({
      title,
      note: note || undefined,
      tracks: normalizedTracks,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: mixtape.id, url: `/tape/${mixtape.id}` });
}
