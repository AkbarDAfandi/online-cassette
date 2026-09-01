import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("mixtapes").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
