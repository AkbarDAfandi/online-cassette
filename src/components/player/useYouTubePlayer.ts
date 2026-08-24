"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PlayerState =
  | "unstarted"
  | "ended"
  | "playing"
  | "paused"
  | "buffering"
  | "cued"
  | "error"
  | "unavailable";

export interface PlayerStatus {
  state: PlayerState;
  errorMessage?: string;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  destroy(): void;
}

const API_URL = "https://www.youtube.com/iframe_api";

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  if (!apiPromise) {
    apiPromise = new Promise<void>((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = API_URL;
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

function mapPlayerState(code: number): PlayerState {
  switch (code) {
    case -1:
      return "unstarted";
    case 0:
      return "ended";
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return "unstarted";
  }
}

function mapErrorCode(code: number): string {
  switch (code) {
    case 2:
      return "Invalid video ID";
    case 5:
      return "Playback error (video not embeddable)";
    case 100:
      return "Video not found or removed";
    case 101:
    case 150:
      return "Embedding not allowed for this video";
    default:
      return "Playback unavailable";
  }
}

export function useYouTubePlayer(options: {
  containerId: string;
  onEnded?: () => void;
  onStateChange?: (status: PlayerStatus) => void;
}) {
  const { containerId, onEnded, onStateChange } = options;
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>({ state: "unstarted" });

  const endedRef = useRef(onEnded);
  const stateChangeRef = useRef(onStateChange);

  useEffect(() => {
    endedRef.current = onEnded;
    stateChangeRef.current = onStateChange;
  }, [onEnded, onStateChange]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadYouTubeApi();
        if (cancelled || !window.YT) return;

        playerRef.current = new window.YT.Player(containerId, {
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              if (!cancelled) setReady(true);
            },
            onStateChange: (event) => {
              const state = mapPlayerState(event.data);
              setStatus({ state });
              stateChangeRef.current?.({ state });
              if (state === "ended") {
                endedRef.current?.();
              }
            },
            onError: (event) => {
              const errorMessage = mapErrorCode(event.data);
              setStatus({ state: "error", errorMessage });
              stateChangeRef.current?.({ state: "error", errorMessage });
            },
          },
        });
      } catch {
        if (!cancelled) {
          setStatus({ state: "error", errorMessage: "Failed to load player" });
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, [containerId]);

  const loadVideo = useCallback((videoId: string) => {
    setStatus({ state: "unstarted" });
    playerRef.current?.loadVideoById(videoId);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.getPlayerState() === 1) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  }, []);

  return { ready, status, loadVideo, play, pause, toggle };
}
