import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ items: [], message: "Missing query" }, { status: 400 });
  }

  const result = await searchYouTube(q);
  return NextResponse.json(result);
}
