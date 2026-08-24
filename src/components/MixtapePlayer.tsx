"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Track } from "@/lib/types";
import { TvScreen } from "./TvScreen";
import { CassetteDeck } from "./CassetteDeck";
import { TrackList } from "./TrackList";
import { useYouTubePlayer } from "./player/useYouTubePlayer";

const PLAYER_ID = "yt-player";

function splitTracks(tracks: Track[]) {
  const sideA: number[] = [];
  const sideB: number[] = [];
  tracks.forEach((t, i) => {
    (t.side === "A" ? sideA : sideB).push(i);
  });
  return sideA.length > 0 ? sideA : sideB;
}

interface MixtapePlayerProps {
  tracks: Track[];
  title: string;
  note?: string;
  editable?: boolean;
  onMove?: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  onToggleSide?: (index: number) => void;
}

export function MixtapePlayer({
  tracks,
  title,
  note,
  editable = false,
  onMove,
  onRemove,
  onToggleSide,
}: MixtapePlayerProps) {
  const [powered, setPowered] = useState(true);
  const [rawIndex, setRawIndex] = useState(0);

  const playOrder = useMemo(() => splitTracks(tracks), [tracks]);

  const currentIndex = tracks.length > 0 ? rawIndex % tracks.length : 0;
  const current = tracks[currentIndex];
  const videoId = current?.videoId ?? null;

  const handleNext = useCallback(() => {
    setRawIndex((prev) => {
      const pos = playOrder.indexOf(prev);
      const next = playOrder[(pos + 1) % playOrder.length];
      return next;
    });
  }, [playOrder]);

  const handlePrev = useCallback(() => {
    setRawIndex((prev) => {
      const pos = playOrder.indexOf(prev);
      const next = playOrder[(pos - 1 + playOrder.length) % playOrder.length];
      return next;
    });
  }, [playOrder]);

  const { ready, status, loadVideo, play, pause } = useYouTubePlayer({
    containerId: PLAYER_ID,
    onEnded: handleNext,
  });

  useEffect(() => {
    if (current?.videoId) {
      loadVideo(current.videoId);
    }
  }, [current?.videoId, loadVideo]);

  const handlePlayPause = useCallback(() => {
    if (!ready || !current) return;
    if (status.state === "playing") {
      pause();
    } else {
      play();
    }
  }, [ready, current, status.state, play, pause]);

  return (
    <div className="mixtape-player">
      <div className="player-top">
        <TvScreen
          power={powered ? "on" : "off"}
          playerContainerId={PLAYER_ID}
          nowPlaying={{
            videoId,
            title: current?.title ?? "",
            artist: current?.artist ?? "",
          }}
        />
        <CassetteDeck
          status={status}
          powered={powered}
          playing={status.state === "playing"}
          side={current?.side ?? "A"}
          trackNumber={current ? current.order + 1 : 0}
          trackCount={tracks.length}
          title={current?.title ?? ""}
          artist={current?.artist ?? ""}
          durationSeconds={current?.durationSeconds ?? 0}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onPower={() => setPowered((p) => !p)}
        />
      </div>

      <div className="player-bottom">
        <div className="tape-info">
          <h1 className="tape-title">{title}</h1>
          {note && <p className="tape-note">{note}</p>}
        </div>
        <TrackList
          tracks={tracks}
          currentIndex={currentIndex}
          onSelect={setRawIndex}
          editable={editable}
          onMove={onMove}
          onRemove={onRemove}
          onToggleSide={onToggleSide}
        />
      </div>
    </div>
  );
}
