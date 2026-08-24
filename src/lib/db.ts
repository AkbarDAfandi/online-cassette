import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import type { Mixtape, Track } from "./types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, "mixtapes.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS mixtapes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mixtapeId TEXT NOT NULL REFERENCES mixtapes(id) ON DELETE CASCADE,
      "order" INTEGER NOT NULL,
      side TEXT NOT NULL,
      videoId TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      durationSeconds INTEGER NOT NULL,
      thumbnailUrl TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tracks_mixtape ON tracks(mixtapeId);
  `);

  return db;
}

function rowToTrack(row: Record<string, unknown>): Track {
  return {
    order: row.order as number,
    side: row.side as Track["side"],
    videoId: row.videoId as string,
    title: row.title as string,
    artist: row.artist as string,
    durationSeconds: row.durationSeconds as number,
    thumbnailUrl: row.thumbnailUrl as string,
  };
}

function rowToMixtape(row: Record<string, unknown>, tracks: Track[]): Mixtape {
  return {
    id: row.id as string,
    title: row.title as string,
    note: row.note as string,
    createdAt: row.createdAt as string,
    tracks,
  };
}

export function createMixtape(input: {
  title: string;
  note?: string;
  tracks: Omit<Track, "order">[];
}): Mixtape {
  const database = getDb();
  const id = randomUUID();

  const insertTape = database.prepare(
    `INSERT INTO mixtapes (id, title, note, createdAt) VALUES (?, ?, ?, ?)`
  );
  const insertTrack = database.prepare(
    `INSERT INTO tracks (mixtapeId, "order", side, videoId, title, artist, durationSeconds, thumbnailUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const createdAt = new Date().toISOString();

  const tx = database.transaction(() => {
    insertTape.run(id, input.title, input.note ?? "", createdAt);
    input.tracks.forEach((t, index) => {
      insertTrack.run(
        id,
        index,
        t.side,
        t.videoId,
        t.title,
        t.artist,
        t.durationSeconds,
        t.thumbnailUrl
      );
    });
  });
  tx();

  return {
    id,
    title: input.title,
    note: input.note ?? "",
    createdAt,
    tracks: input.tracks.map((t, index) => ({ ...t, order: index })),
  };
}

export function getMixtape(id: string): Mixtape | null {
  const database = getDb();
  const tape = database
    .prepare(`SELECT * FROM mixtapes WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;

  if (!tape) return null;

  const tracks = (
    database
      .prepare(`SELECT * FROM tracks WHERE mixtapeId = ? ORDER BY "order" ASC`)
      .all(id) as Record<string, unknown>[]
  ).map(rowToTrack);

  return rowToMixtape(tape, tracks);
}

export function mixtapeExists(id: string): boolean {
  const database = getDb();
  return !!database.prepare(`SELECT 1 FROM mixtapes WHERE id = ?`).get(id);
}
