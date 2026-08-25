"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const wasPlayingRef = useRef(false);

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

  const handleSwitchSide = useCallback(() => {
    if (!current || tracks.length === 0) return;
    const target = current.side === "A" ? "B" : "A";
    const idx = tracks.findIndex((t) => t.side === target);
    if (idx !== -1) {
      wasPlayingRef.current = status.state === "playing";
      setRawIndex(idx);
    }
  }, [current, tracks, status.state]);

  useEffect(() => {
    if (status.state === "playing" && wasPlayingRef.current) {
      wasPlayingRef.current = false;
      play();
    }
  }, [status.state, play]);

  return (
    <div className="mixtape-player">
      <div className="player-top">
        <TvScreen
          power={powered ? "on" : "off"}
          playerContainerId={PLAYER_ID}
          nowPlaying={{
            videoId,
            title: current?.title ?? title,
            artist: current?.artist ?? note ?? "by_ you",
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
          onToggleSide={editable ? onToggleSide : handleSwitchSide}
        />
      </div>
    </div>
  );
}
