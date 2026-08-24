"use client";

export type PowerState = "on" | "off";

export function CrtScreen({
  power,
  children,
}: {
  power: PowerState;
  children?: React.ReactNode;
}) {
  return (
    <div className="crt-bezel">
      <div className={`crt-screen ${power === "on" ? "is-on" : "is-off"}`}>
        <div className="crt-screen-inner">{children}</div>

        <div className="crt-scanlines" aria-hidden="true" />
        <div className="crt-vignette" aria-hidden="true" />
        <div className="crt-flicker" aria-hidden="true" />
        <div className="crt-noise" aria-hidden="true" />
        <div className="crt-rolling-bar" aria-hidden="true" />
        <div className="crt-glass" aria-hidden="true" />
      </div>
    </div>
  );
}
