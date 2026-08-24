import { NextResponse } from "next/server";
import { getMixtape } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mixtape = getMixtape(id);

  if (!mixtape) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(mixtape);
}
