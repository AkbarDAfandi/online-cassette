# Mixtape & Static — Build Spec

A Y2K-styled web app where users build a "mixtape" from YouTube tracks, style it as
a retro CRT TV + cassette deck, and share a link so a friend can play the full
mixtape with **no login required**.

Inspired by burncd.online, but removes the 30-second preview limit by using
full-length YouTube embeds instead of Apple Music previews.

---

## 1. Core concept

- **Audio source:** YouTube IFrame embeds (official audio / lyric videos), not
  hosted/uploaded files. Full track length, free, no auth wall for the listener.
- **Visual concept:** A retro analogue TV (screen shows the YouTube video styled
  as fuzzy broadcast footage — scanlines, vignette, flicker, noise) paired with a
  cassette deck as the actual transport control (play/pause/next/prev, spinning
  reels, LCD readout).
- **No login for the receiver.** Whoever gets the share link should be able to
  open it and press play immediately.

A working front-end mockup of the TV + cassette UI already exists at
`mixtape_tv_mockup.html` (reference for structure/interactions — colors and UI
polish will be redone, so treat it as functional reference, not final visual
direction).

---

## 2. User flows

### Flow A — Create a mixtape ("burn a tape")
1. User searches for songs (title/artist).
2. Search returns candidate tracks with metadata (title, artist, thumbnail,
   duration) and an associated YouTube video ID.
3. User adds tracks to their mixtape (reorderable, up to some max e.g. 12–15
   tracks / two "sides").
4. User gives the mixtape a title (e.g. tape label text) and optionally a short
   note/message (like a note written on a cassette insert).
5. User saves/"burns" the tape → generates a unique shareable URL.

### Flow B — Receive a mixtape
1. Receiver opens the share link — no account/login required.
2. Sees the TV + cassette UI pre-loaded with the sender's tracklist and note.
3. Can press play and control playback (play/pause/next/prev/select track)
   exactly like the mockup demonstrates.
4. Optional: receiver can "copy this tape" to make/send their own using the same
   tracks as a starting point (nice-to-have, not required for v1).

---

## 3. Track search & metadata

- Use the **YouTube Data API v3 `search.list`** endpoint (or an equivalent) to
  search by title/artist and return: video ID, title, channel/artist name,
  thumbnail, duration.
- Optionally cross-reference with the **iTunes Search API** (free, no key
  required) purely for cleaner metadata/artwork if YouTube's title/thumbnail
  data is messy — audio playback still comes from YouTube.
- Store on each mixtape track: `videoId`, `title`, `artist`, `durationSeconds`,
  `thumbnailUrl`, `side` (A/B), `order`.

---

## 4. Playback requirements

- Use the **YouTube IFrame Player API** (`https://www.youtube.com/iframe_api`),
  not a bare `<iframe src=...>` reload — needed for real play/pause/seek/next
  control and `onStateChange` events (the current mockup fakes pause by
  reloading the iframe; replace with proper API calls).
- Player must remain visibly on-screen per YouTube's embed Terms of Service —
  CSS filters/overlays for the "fuzzy broadcast" look are fine, but do not use
  `display:none`, `opacity:0`, or fully occlude the player with an opaque layer.
- Autoplay: browsers block unmuted autoplay without user interaction, so
  playback should be user-initiated (first "play" press), not on page load.
- Handle YouTube API states: unstarted, playing, paused, buffering, ended
  (advance to next track on `ended`).
- Handle unavailable/region-blocked videos gracefully (skip with a message,
  don't hard-fail the whole tape).

---

## 5. Data model (suggested)

```
Mixtape
  id (uuid, used in share URL)
  title
  note (optional, short text)
  createdAt
  tracks: [
    {
      order
      side ("A" | "B")
      videoId
      title
      artist
      durationSeconds
      thumbnailUrl
    }
  ]
```

- Mixtapes are read-only once created (no auth system needed for v1 — the
  share link itself is the access control, similar to a Google Docs "anyone
  with the link" model).
- Persist mixtapes in a simple database (e.g. a key-value or document store
  keyed by mixtape id) — no user accounts required for v1.

---

## 6. Sharing

- Each saved mixtape gets a unique URL, e.g. `/tape/{id}`.
- That page renders the TV/cassette player pre-loaded with the mixtape's data,
  fetched by `id` — no login/auth needed to view or play.
- Nice-to-have: Open Graph meta tags so the shared link shows a nice
  preview card (tape title + note) when pasted into iMessage/Discord/etc.

---

## 7. Out of scope for v1

- User accounts / login system.
- Hosting or uploading actual audio files.
- Editing a mixtape after it's been shared (create a new one instead).
- Mobile app — responsive web only.

---

## 8. Reference implementation

See `mixtape_tv_mockup.html` for:
- TV + cassette DOM/CSS structure
- "Fuzzy broadcast" screen effect layers (scanlines, vignette, flicker, noise,
  rolling bar) as CSS classes applied over the video
- Transport button / reel-spin / LCD readout interaction pattern
- Tracklist rendering and click-to-play behavior

The agent should treat this file as a structural/interaction reference only —
colors, fonts, and overall visual styling will be redesigned separately.
