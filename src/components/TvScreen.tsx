"use client";

import { CrtScreen } from "./CrtScreen";

export interface NowPlaying {
  videoId: string | null;
  title: string;
  artist: string;
}

export function TvScreen({
  power,
  playerContainerId,
  nowPlaying,
}: {
  power: "on" | "off";
  playerContainerId: string;
  nowPlaying: NowPlaying;
}) {
  return (
    <CrtScreen power={power}>
      <div className="absolute inset-0 bg-black">
        <div id={playerContainerId} className="absolute inset-0" />
        {!nowPlaying.videoId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="crt-standby-text">
              {power === "off" ? "NO SIGNAL" : "PRESS PLAY"}
            </div>
          </div>
        )}
      </div>
    </CrtScreen>
  );
}
