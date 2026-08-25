import type { Metadata } from "next";
import { Creator } from "@/components/Creator";

export const metadata: Metadata = {
  title: "Mixtape & Static — Burn a tape",
  description:
    "Build a mixtape from YouTube tracks, style it as a retro CRT TV + cassette deck, and share a link.",
};

export default function Home() {
  return (
    <div className="app-shell">
      <header className="header">
        <span className="logo">
          <span>Digital Cassette</span>
          <em>Creator</em>
        </span>
        <span className="window-controls" aria-hidden="true">
          <span>?</span>
          <span>⚙</span>
          <span>−</span>
          <span>□</span>
          <span>×</span>
        </span>
      </header>
      <Creator />
      <footer className="footer">
        <span>Mixtape &amp; Static</span>
        <span>Burn a tape · share a link · no login</span>
      </footer>
    </div>
  );
}
