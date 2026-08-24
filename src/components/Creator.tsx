"use client";

import { useCallback, useState } from "react";
import type { SearchCandidate, SearchResult, Track } from "@/lib/types";
import { MixtapePlayer } from "./MixtapePlayer";

const MAX_TRACKS = 15;

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

  const addTrack = (candidate: SearchCandidate) => {
    if (tracks.length >= MAX_TRACKS) return;
    const side: "A" | "B" =
      tracks.filter((t) => t.side === "A").length <=
      tracks.filter((t) => t.side === "B").length
        ? "A"
        : "B";
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
    setTracks((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, side: t.side === "A" ? "B" : "A" } : t
      )
    );
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

  return (
    <div className="creator-grid">
      <div className="panel">
        <h2 className="panel-title">Build your tape</h2>

        <div className="search-row">
          <input
            className="input"
            placeholder="Search songs… (title or artist)"
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
                  {r.artist} · {formatDuration(r.durationSeconds)}
                </div>
              </div>
              <button
                className="btn search-result-add"
                onClick={() => addTrack(r)}
                disabled={tracks.length >= MAX_TRACKS}
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="creator-actions">
          <div className="field">
            <label className="field-label">Tape title</label>
            <input
              className="input"
              placeholder="e.g. Summer '99"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Note (optional)</label>
            <textarea
              className="input"
              placeholder="A note on the cassette insert…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || tracks.length === 0}
          >
            {saving ? "Burning…" : "Burn this tape"}
          </button>

          <p className="search-hint">
            {tracks.length}/{MAX_TRACKS} tracks · two sides
          </p>

          {shareUrl && (
            <div className="share-box">
              <div className="field-label">Your tape is ready</div>
              <div className="share-link">
                <input className="input" readOnly value={shareUrl} />
                <button className="btn" onClick={copyLink}>
                  Copy
                </button>
              </div>
              <p className="search-hint">
                <a className="copy-link" href={shareUrl}>
                  Open your tape →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <MixtapePlayer
        tracks={tracks}
        title={title || "Untitled"}
        note={note || undefined}
        editable
        onMove={moveTrack}
        onRemove={removeTrack}
        onToggleSide={toggleSide}
      />
    </div>
  );
}
