"use client";

import { useCallback, useState } from "react";
import type { SearchCandidate, SearchResult, Track } from "@/lib/types";
import { MixtapePlayer } from "./MixtapePlayer";

const MAX_TRACKS = 20;
const MAX_PER_SIDE = 10;

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Creator() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCandidate[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as SearchResult;
      setResults(data.items ?? []);
      setSearchMessage(data.message ?? null);
    } catch {
      setResults([]);
      setSearchMessage("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const sideIsFull = (side: "A" | "B") =>
    tracks.filter((t) => t.side === side).length >= MAX_PER_SIDE;

  const addTrack = (candidate: SearchCandidate) => {
    if (tracks.length >= MAX_TRACKS) return;
    const aFull = sideIsFull("A");
    const bFull = sideIsFull("B");
    if (aFull && bFull) return;
    let side: "A" | "B";
    if (!aFull) side = "A";
    else side = "B";
    const track: Track = {
      order: tracks.length,
      side,
      videoId: candidate.videoId,
      title: candidate.title,
      artist: candidate.artist,
      durationSeconds: candidate.durationSeconds,
      thumbnailUrl: candidate.thumbnailUrl,
    };
    setTracks((prev) => [...prev, track]);
  };

  const removeTrack = (index: number) => {
    setTracks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((t, i) => ({ ...t, order: i }))
    );
  };

  const moveTrack = (from: number, to: number) => {
    setTracks((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((t, i) => ({ ...t, order: i }));
    });
  };

  const toggleSide = (index: number) => {
    setTracks((prev) => {
      const track = prev[index];
      if (!track) return prev;
      const target = track.side === "A" ? "B" : "A";
      if (prev.filter((t) => t.side === target).length >= MAX_PER_SIDE) {
        return prev;
      }
      return prev.map((t, i) => (i === index ? { ...t, side: target } : t));
    });
  };

  const save = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Give your tape a title.");
      return;
    }
    if (tracks.length === 0) {
      setError("Add at least one track.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/tapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          note: note.trim(),
          tracks: tracks.map((t) => ({
            side: t.side,
            videoId: t.videoId,
            title: t.title,
            artist: t.artist,
            durationSeconds: t.durationSeconds,
            thumbnailUrl: t.thumbnailUrl,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      const url = `${window.location.origin}/tape/${data.id}`;
      setShareUrl(url);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  const clearAll = () => {
    setTracks([]);
    setTitle("");
    setNote("");
    setShareUrl(null);
    setError(null);
  };

  return (
    <div className="creator-grid">
      <aside className="panel creator-sidebar">
        <section className="creator-step search-step">
          <h2 className="panel-title">
            <span className="step-badge">1</span>
            Search music
          </h2>
          <p className="search-hint">
            Search your favorite songs from YouTube
          </p>

          <div className="search-row">
            <input
              className="input"
              placeholder="lofi hip hop"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
            <button className="btn" onClick={runSearch} disabled={searching}>
              {searching ? "…" : "Search"}
            </button>
          </div>

          {searchMessage && <p className="search-hint">{searchMessage}</p>}

          <div className="search-results">
            {results.length === 0 && (
              <div className="search-empty">
                Search for a track to load cassette-ready results.
              </div>
            )}
            {results.map((r) => (
              <div className="search-result" key={r.videoId}>
                {r.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="search-result-thumb"
                    src={r.thumbnailUrl}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="search-result-meta">
                  <div className="search-result-title">{r.title}</div>
                  <div className="search-result-artist">
                    {r.artist}
                  </div>
                </div>
                <span className="search-result-time">
                  {formatDuration(r.durationSeconds)}
                </span>
                <button
                  className="btn search-result-add"
                  onClick={() => addTrack(r)}
                  disabled={tracks.length >= MAX_TRACKS}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="creator-step share-panel">
          <h2 className="panel-title">
            <span className="step-badge">2</span>
            Share cassette
          </h2>
          <p className="search-hint">
            Name your cassette, save it, then copy the share link.
          </p>

          <div className="share-form">
            <div className="field">
              <label className="field-label">Cassette title</label>
              <input
                className="input"
                placeholder="Untitled Cassette"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Creator note</label>
              <input
                className="input"
                placeholder="by_ you"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="share-panel-meta">
              <span>{tracks.length}/{MAX_TRACKS} tracks loaded</span>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="save-row">
              <button className="btn btn-ghost" onClick={clearAll}>
                Clear all
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={saving || tracks.length === 0}
              >
                {saving ? "Saving…" : "Save cassette"}
              </button>
            </div>

            {shareUrl && (
              <div className="share-box">
                <div className="field-label">Your cassette is ready</div>
                <div className="share-link">
                  <input className="input" readOnly value={shareUrl} />
                  <button className="btn" onClick={copyLink}>
                    Copy
                  </button>
                </div>
                <p className="search-hint">
                  <a className="copy-link" href={shareUrl}>
                    Open your cassette →
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>
      </aside>

      <main className="creator-stage">
        <MixtapePlayer
          tracks={tracks}
          title={title || "Custom Mix"}
          note={note || "by_ you"}
          editable
          onMove={moveTrack}
          onRemove={removeTrack}
          onToggleSide={toggleSide}
        />
      </main>
    </div>
  );
}
