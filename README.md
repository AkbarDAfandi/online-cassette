# Mixtape & Static

A Y2K-styled web app for building a "mixtape" from YouTube tracks, styling it as a
retro CRT TV + cassette deck, and sharing a link that anyone can play with **no
login required**.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** (hosted Postgres) — mixtapes stored as a single document keyed by id
- **YouTube IFrame Player API** for full-length playback
- **YouTube Data API v3** for search (server-side proxy keeps the key private)

## Setup

```bash
npm install
cp .env.example .env.local
```

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then run the migration
in **`supabase/migrations/0001_create_mixtapes.sql`** in the SQL Editor (or link
the project with the Supabase CLI and run `supabase db push`).

### 2. Configure environment variables

Edit `.env.local`:

| Variable              | Required | Description                                                          |
| --------------------- | -------- | -------------------------------------------------------------------- |
| `YOUTUBE_API_KEY`     | optional | Google Cloud API key. Without it, search is disabled (demo msg).     |
| `NEXT_PUBLIC_BASE_URL`| optional | Public URL for share links + OG tags. Defaults to localhost.         |
| `SUPABASE_URL`        | required | Project URL from Supabase **Project Settings → API**.                |
| `SUPABASE_ANON_KEY`   | required | `anon` public key from Supabase **Project Settings → API**.          |

```bash
npm run dev
```

Open http://localhost:3000.

## How it works

- **`/`** — "burn a tape" creator: search tracks, add/reorder them across two
  sides (max 5 per side / 10 total), write a title + note, and save. Saving
  returns a share URL.
- **`/tape/[id]`** — receiver view: the tape pre-loaded and playable, no auth.
  Rendered server-side with Open Graph tags for a nice share preview.
- **`/api/search?q=…`** — proxies YouTube Data API `search.list` + `videos.list`
  (for durations). Returns clean track candidates.
- **`/api/tapes`** (`POST`) — validates and stores a mixtape.
- **`/api/tapes/[id]`** (`GET`) — fetches a mixtape by id.

### Playback

The player uses the **YouTube IFrame Player API** (not a bare iframe reload), so
play/pause/next/prev are real API calls with `onStateChange` events. The video
stays visibly on-screen (CSS scanline/vignette/flicker/noise overlays are applied,
but never `display:none` / `opacity:0`), per YouTube's embed terms. Autoplay is
user-initiated (first play press). On `ended`, playback advances to the next track;
unavailable/region-blocked videos surface an error message rather than failing the
whole tape.

## Data model

```
Mixtape { id (uuid), title, note, createdAt, tracks: Track[] }
Track   { order, side ("A"|"B"), videoId, title, artist, durationSeconds, thumbnailUrl }
```

Stored in a single Supabase row per mixtape, with `tracks` as a `jsonb` column.
Mixtapes are read-only once created — the share link itself is the access control
(RLS policies allow public read + insert).

## Notes

- This is v1. Out of scope: accounts/login, uploading audio, editing a shared
  tape, native mobile apps.
- The spec referenced `mixtape_tv_mockup.html` as a visual reference; that file
  was not present in the repo, so the CRT TV + cassette UI was built from the
  description in `PROJECT_SPEC.md` §8.
