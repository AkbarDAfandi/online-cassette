import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Mixtape, Track } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

interface MixtapeRow {
  id: string;
  title: string;
  note: string;
  created_at: string;
  tracks: Track[];
}

function rowToMixtape(row: MixtapeRow): Mixtape {
  return {
    id: row.id,
    title: row.title,
    note: row.note || undefined,
    createdAt: row.created_at,
    tracks: row.tracks ?? [],
  };
}

export async function createMixtape(input: {
  title: string;
  note?: string;
  tracks: Omit<Track, "order">[];
}): Promise<Mixtape> {
  const supabase = getClient();
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const tracks: Track[] = input.tracks.map((t, index) => ({
    ...t,
    order: index,
  }));

  const row: MixtapeRow = {
    id,
    title: input.title,
    note: input.note ?? "",
    created_at: createdAt,
    tracks,
  };

  const { error } = await supabase.from("mixtapes").insert(row);

  if (error) {
    throw new Error(`Failed to save mixtape: ${error.message}`);
  }

  return {
    id,
    title: input.title,
    note: input.note ?? "",
    createdAt,
    tracks,
  };
}

export async function getMixtape(id: string): Promise<Mixtape | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("mixtapes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to load mixtape: ${error.message}`);
  }

  return rowToMixtape(data as MixtapeRow);
}
