"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Track } from "@/lib/types";
import { TvScreen } from "./TvScreen";
import { CassetteDeck } from "./CassetteDeck";
import { TrackList } from "./TrackList";
import { useYouTubePlayer } from "./player/useYouTubePlayer";

const PLAYER_ID = "yt-player";

function sideIndices(tracks: Track[], side: "A" | "B"): number[] {
  const indices: number[] = [];
  tracks.forEach((t, i) => {
    if (t.side === side) indices.push(i);
  });
  return indices;
}

interface MixtapePlayerProps {
  tracks: Track[];
  title: string;
  note?: string;
  editable?: boolean;
  autoplay?: boolean;
  onMove?: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  onToggleSide?: (index: number) => void;
}

export function MixtapePlayer({
  tracks,
  title,
  note,
  editable = false,
  autoplay = false,
  onMove,
  onRemove,
  onToggleSide,
}: MixtapePlayerProps) {
  const [powered, setPowered] = useState(true);
  const [bootDone, setBootDone] = useState(false);
  const [rawIndex, setRawIndex] = useState(0);
  const wasPlayingRef = useRef(false);
  const didAutoPlayRef = useRef(false);

  const currentIndex = tracks.length > 0 ? rawIndex % tracks.length : 0;
  const current = tracks[currentIndex];
  const videoId = current?.videoId ?? null;
  const booting = autoplay && !bootDone;

  const handleNext = useCallback(() => {
    setRawIndex((prev) => {
      const cur = tracks[prev] ?? tracks[0];
      if (!cur) return prev;
      const order = sideIndices(tracks, cur.side);
      if (order.length === 0) return prev;
      const pos = order.indexOf(prev);
      const next = order[(pos + 1) % order.length];
      return next;
    });
  }, [tracks]);

  const handlePrev = useCallback(() => {
    setRawIndex((prev) => {
      const cur = tracks[prev] ?? tracks[0];
      if (!cur) return prev;
      const order = sideIndices(tracks, cur.side);
      if (order.length === 0) return prev;
      const pos = order.indexOf(prev);
      const next = order[(pos - 1 + order.length) % order.length];
      return next;
    });
  }, [tracks]);

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

  useEffect(() => {
    if (!autoplay || didAutoPlayRef.current) return;
    if (ready && current?.videoId) {
      didAutoPlayRef.current = true;
      play();
    }
  }, [autoplay, ready, current?.videoId, play]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setBootDone(true), 700);
    return () => clearTimeout(t);
  }, [autoplay]);

  return (
    <div className="mixtape-player">
      <div className="player-top">
        <TvScreen
          power={powered ? "on" : "off"}
          booting={booting}
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
          tapeTitle={title}
          creator={note ?? ""}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onPower={() => setPowered((p) => !p)}
        />
      </div>

      <div className="player-bottom">
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
