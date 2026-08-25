"use client";

import type { Track } from "@/lib/types";

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TrackListProps {
  tracks: Track[];
  currentIndex: number;
  onSelect: (index: number) => void;
  editable?: boolean;
  onMove?: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  onToggleSide?: (index: number) => void;
}

export function TrackList({
  tracks,
  currentIndex,
  onSelect,
  editable = false,
  onMove,
  onRemove,
  onToggleSide,
}: TrackListProps) {
  if (tracks.length === 0 && !editable) {
    return (
      <div className="tracklist-empty">
        This tape is empty.
      </div>
    );
  }

  const sideA = tracks.filter((t) => t.side === "A");
  const sideB = tracks.filter((t) => t.side === "B");

  const renderSide = (label: "A" | "B", items: Track[]) => {
    return (
      <div className="tracklist-side">
        <div className="tracklist-side-label">
          <span>SIDE <b>{label}</b></span>
          <span>30:00</span>
        </div>
        <ul className="tracklist-list">
          {items.length === 0 &&
            editable &&
            Array.from({ length: 5 }).map((_, i) => (
              <li className="tracklist-item is-placeholder" key={`${label}-${i}`}>
                <button className="tracklist-main" disabled>
                  <span className="tracklist-num">{i + 1}.</span>
                  <span className="tracklist-meta">
                    <span className="tracklist-title">Drag a song here</span>
                  </span>
                  <span className="tracklist-dur">--:--</span>
                </button>
              </li>
            ))}
          {items.length === 0 && !editable && (
            <li className="tracklist-item is-placeholder">
              <button className="tracklist-main" disabled>
                <span className="tracklist-meta">
                  <span className="tracklist-title">Empty</span>
                </span>
              </button>
            </li>
          )}
          {items.map((track) => {
            const index = tracks.indexOf(track);
            const active = index === currentIndex;
            const moveSideLabel = label === "A" ? "Move to side B" : "Move to side A";
            return (
              <li
                key={`${track.videoId}-${track.order}-${index}`}
                className={`tracklist-item ${active ? "is-active" : ""}`}
              >
                <button
                  className="tracklist-main"
                  onClick={() => onSelect(index)}
                >
                  <span className="tracklist-num">
                    {String(track.order + 1).padStart(2, "0")}
                  </span>
                  <span className="tracklist-meta">
                    <span className="tracklist-title">{track.title}</span>
                    <span className="tracklist-artist">{track.artist}</span>
                  </span>
                  <span className="tracklist-dur">
                    {formatDuration(track.durationSeconds)}
                  </span>
                </button>

                {editable && (
                  <span className="tracklist-controls">
                    {onToggleSide && (
                      <button
                        className="tracklist-mini tracklist-side-move"
                        onClick={() => onToggleSide(index)}
                        title={moveSideLabel}
                      >
                        {label === "A" ? "→" : "←"}
                      </button>
                    )}
                    {onMove && (
                      <>
                        <button
                          className="tracklist-mini"
                          onClick={() => onMove(index, index - 1)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="tracklist-mini"
                          onClick={() => onMove(index, index + 1)}
                          disabled={index === tracks.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    {onRemove && (
                      <button
                        className="tracklist-mini tracklist-remove"
                        onClick={() => onRemove(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="tracklist">
      {renderSide("A", sideA)}
      {!editable && (
        <button
          className="side-switcher"
          onClick={() => onToggleSide?.(currentIndex)}
          disabled={tracks.length === 0 || !onToggleSide}
          title="Switch side"
        >
          <span>A</span>
          <span className="side-switcher-track">
            <span className={`side-switcher-thumb is-${tracks[currentIndex]?.side ?? "A"}`} />
          </span>
          <span>B</span>
        </button>
      )}
      {renderSide("B", sideB)}
    </div>
  );
}
