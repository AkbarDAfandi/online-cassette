"use client";

import Link from "next/link";
import type { Mixtape } from "@/lib/types";
import { MixtapePlayer } from "./MixtapePlayer";

export function TapeView({ mixtape }: { mixtape: Mixtape }) {
  return (
    <div className="app-shell">
      <header className="header">
        <span className="logo">Mixtape &amp; Static</span>
        <Link className="copy-link" href="/">
          Burn your own →
        </Link>
      </header>
      <MixtapePlayer
        tracks={mixtape.tracks}
        title={mixtape.title}
        note={mixtape.note}
      />
    </div>
  );
}
