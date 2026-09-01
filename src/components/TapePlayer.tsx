"use client";

import { useState } from "react";
import { MixtapePlayer } from "./MixtapePlayer";
import type { Mixtape } from "@/lib/types";
import { playSfx } from "@/lib/sfx";

export function TapePlayer({ mixtape }: { mixtape: Mixtape }) {
  const [started, setStarted] = useState(false);

  const handlePlayIt = () => {
    playSfx("insert");
    playSfx("start");
    setStarted(true);
  };

  return (
    <div className="tape-player-shell">
      {!started && (
        <div className="tape-intro">
          <button className="play-it-btn" onClick={handlePlayIt}>
            ▶ Play it
          </button>
        </div>
      )}

      <div className={started ? "player-reveal is-revealed" : "player-reveal"}>
        <MixtapePlayer
          tracks={mixtape.tracks}
          title={mixtape.title}
          note={mixtape.note}
          autoplay={started}
        />
      </div>
    </div>
  );
}
