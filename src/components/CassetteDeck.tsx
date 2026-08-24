"use client";

import type { PlayerStatus } from "./player/useYouTubePlayer";
import { Marquee } from "./Marquee";

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
  onPlayPause,
  onNext,
  onPrev,
  onPower,
}: DeckProps) {
  const spinning = powered && playing;

  return (
    <div className={`deck ${powered ? "deck-on" : "deck-off"}`}>
      <div className="deck-topline">
        <span className="deck-brand">MIXTAPE•2000</span>
        <button className="deck-power" onClick={onPower} aria-label="Power">
          <span className="deck-power-dot" />
        </button>
      </div>

      <div className="deck-reel-window">
        <div className={`reel reel-left ${spinning ? "is-spinning" : ""}`}>
          <div className="reel-hub" />
          <div className="reel-spoke s1" />
          <div className="reel-spoke s2" />
          <div className="reel-spoke s3" />
          <div className="reel-spoke s4" />
        </div>
        <div className={`reel reel-right ${spinning ? "is-spinning" : ""}`}>
          <div className="reel-hub" />
          <div className="reel-spoke s1" />
          <div className="reel-spoke s2" />
          <div className="reel-spoke s3" />
          <div className="reel-spoke s4" />
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

      <div className="deck-transport">
        <button className="deck-btn" onClick={onPrev} aria-label="Previous track">
          ◀◀
        </button>
        <button
          className="deck-btn deck-btn-play"
          onClick={onPlayPause}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="deck-btn" onClick={onNext} aria-label="Next track">
          ▶▶
        </button>
      </div>
    </div>
  );
}
