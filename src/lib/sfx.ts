"use client";

export type SfxName =
  | "insert"
  | "start"
  | "static"
  | "buttonA"
  | "buttonB";

const FILES: Record<SfxName, string> = {
  insert: "/sfx/vhs_insert.mp3",
  start: "/sfx/crt_start.mp3",
  static: "/sfx/crt_static.mp3",
  buttonA: "/sfx/crt_buttonA.mp3",
  buttonB: "/sfx/crt_buttonB.mp3",
};

const cache = new Map<SfxName, HTMLAudioElement>();

function getAudio(name: SfxName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  let el = cache.get(name);
  if (!el) {
    el = new Audio(FILES[name]);
    el.preload = "auto";
    cache.set(name, el);
  }
  return el;
}

export function playSfx(name: SfxName) {
  const el = getAudio(name);
  if (!el) return;
  try {
    el.volume = 1;
    el.currentTime = 0;
    const p = el.play();
    if (p) p.catch(() => undefined);
  } catch {
    // ignore autoplay rejections
  }
}
