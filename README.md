# Mixtape & Static

A Y2K-styled web app for building a "mixtape" from YouTube tracks, styling it as a
retro CRT TV + cassette deck, and sharing a link that anyone can play with **no
login required**.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **SQLite** via `better-sqlite3` (no accounts, mixtapes keyed by id)
- **YouTube IFrame Player API** for full-length playback
- **YouTube Data API v3** for search (server-side proxy keeps the key private)

## Setup

```bash
npm install
cp .env.example .env.local
```

Then edit `.env.local`:

| Variable               | Required | Description                                                      |
| ---------------------- | -------- | ---------------------------------------------------------------- |
| `YOUTUBE_API_KEY`      | optional | Google Cloud API key. Without it, search is disabled (demo msg). |
| `NEXT_PUBLIC_BASE_URL` | optional | Public URL for share links + OG tags. Defaults to localhost.     |
| `DATA_DIR` / `DB_PATH` | optional | Override the SQLite file location. Defaults to `./data/mixtapes.db`. |

```bash
npm run dev
```

Open http://localhost:3000.

## How it works

- **`/`** — "burn a tape" creator: search tracks, add/reorder them across two
  sides (max 15), write a title + note, and save. Saving returns a share URL.
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
Mixtape { id (uuid), title, note, createdAt }
Track   { order, side ("A"|"B"), videoId, title, artist, durationSeconds, thumbnailUrl }
```

Mixtapes are read-only once created — the share link itself is the access control.

## Notes

- This is v1. Out of scope: accounts/login, uploading audio, editing a shared
  tape, native mobile apps.
- The spec referenced `mixtape_tv_mockup.html` as a visual reference; that file
  was not present in the repo, so the CRT TV + cassette UI was built from the
  description in `PROJECT_SPEC.md` §8.
