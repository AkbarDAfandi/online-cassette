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
          <div className="crt-preview">
            <div className="crt-preview-top">
              <span>DIGITAL CASSETTE<br />PREVIEW</span>
              <span>--:-- / --:--</span>
            </div>
            <div className="crt-preview-center">
              <div className="crt-preview-title">
                {power === "off" ? "NO SIGNAL" : nowPlaying.title}
              </div>
              <div className="crt-preview-artist">{nowPlaying.artist}</div>
              <div className="crt-preview-play">▶ PLAY</div>
            </div>
            <div className="crt-preview-bottom">
              <span>SP</span>
              <span>00:00:00</span>
            </div>
          </div>
        )}
      </div>
    </CrtScreen>
  );
}
