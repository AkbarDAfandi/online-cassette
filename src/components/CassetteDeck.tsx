"use client";

import type { PlayerStatus } from "./player/useYouTubePlayer";
import { Marquee } from "./Marquee";
import { playSfx } from "@/lib/sfx";

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface DeckProps {
  status: PlayerStatus;
  powered: boolean;
  playing: boolean;
  side: "A" | "B";
  trackNumber: number;
  trackCount: number;
  title: string;
  artist: string;
  durationSeconds: number;
  tapeTitle: string;
  creator: string;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPower: () => void;
}

export function CassetteDeck({
  status,
  powered,
  playing,
  side,
  trackNumber,
  trackCount,
  title,
  artist,
  durationSeconds,
  tapeTitle,
  creator,
  onPlayPause,
  onNext,
  onPrev,
  onPower,
}: DeckProps) {
  return (
    <div className={`deck ${powered ? "deck-on" : "deck-off"}`}>
      <div className="deck-topline">
        <span className="deck-brand">MIXTAPE•2000</span>
        <button className="deck-power" onClick={onPower} aria-label="Power">
          <span className="deck-power-dot" />
        </button>
      </div>

      <div className="deck-reel-window">
        <div className="deck-case-label">
          <Marquee className="deck-case-title" text={tapeTitle || "NO TAPE"} />
          <Marquee className="deck-case-creator" text={creator} />
        </div>
        <div className="deck-tape-line" />
      </div>

      <div className="deck-lcd">
        <div className="deck-lcd-top">
          <span className="deck-lcd-side">SIDE {side}</span>
          <span className="deck-lcd-count">
            {trackNumber.toString().padStart(2, "0")}/{trackCount
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
        <Marquee className="deck-lcd-title" text={title || "NO TAPE"} />
        <Marquee className="deck-lcd-artist" text={artist} />
        <div className="deck-lcd-bottom">
          <span className="deck-lcd-time">{formatDuration(durationSeconds)}</span>
          <span className="deck-lcd-state">
            {status.state === "playing"
              ? "PLAY"
              : status.state === "buffering"
                ? "LOAD"
                : status.state === "paused"
                  ? "PAUSE"
                  : "STOP"}
          </span>
        </div>
      </div>

      <div className="deck-play-control">
        <button
          className="deck-btn deck-btn-play"
          onClick={() => {
            playSfx("buttonA");
            onPlayPause();
          }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>

      <div className="deck-transport">
        <button
          className="deck-btn"
          onClick={() => {
            playSfx("buttonB");
            onPrev();
          }}
          aria-label="Previous track"
        >
          <span className="deck-btn-icon">◀</span>
          <span className="deck-btn-label">BACK</span>
        </button>
        <button
          className="deck-btn"
          onClick={() => {
            playSfx("buttonB");
            onNext();
          }}
          aria-label="Next track"
        >
          <span className="deck-btn-icon">▶</span>
          <span className="deck-btn-label">NEXT</span>
        </button>
      </div>
    </div>
  );
}
