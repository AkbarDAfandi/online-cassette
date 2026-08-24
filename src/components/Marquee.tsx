"use client";

import { useEffect, useRef, useState } from "react";

export function Marquee({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const measure = () => {
      setOverflow(track.scrollWidth > container.clientWidth + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(track);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={containerRef} className={`marquee ${className ?? ""}`}>
      <div
        key={text}
        ref={trackRef}
        className={`marquee-track ${overflow ? "is-scrolling" : ""}`}
      >
        <span className="marquee-copy">{text}</span>
        {overflow && <span className="marquee-copy">{text}</span>}
      </div>
    </div>
  );
}
