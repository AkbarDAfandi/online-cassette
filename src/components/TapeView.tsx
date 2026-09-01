"use client";

import Link from "next/link";
import type { Mixtape } from "@/lib/types";
import { TapePlayer } from "./TapePlayer";

export function TapeView({ mixtape }: { mixtape: Mixtape }) {
  return (
    <div className="app-shell">
      <header className="header">
        <Link className="logo" href="/">
          <span>Digital Cassette</span>
          <em>Player</em>
        </Link>
        <span className="window-controls" aria-hidden="true">
          <span>?</span>
          <span>⚙</span>
          <span>−</span>
          <span>□</span>
          <span>×</span>
        </span>
      </header>

      <main className="player-stage">
        <TapePlayer mixtape={mixtape} />
      </main>

      <footer className="footer">
        <span>Mixtape &amp; Static</span>
        <span>Made with the Digital Cassette Player</span>
      </footer>
    </div>
  );
}
