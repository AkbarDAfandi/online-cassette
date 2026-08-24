import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mixtape & Static",
    template: "%s · Mixtape & Static",
  },
  description:
    "A Y2K mixtape player — build a tape from YouTube tracks and share it. No login required.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "Mixtape & Static",
    description: "A Y2K mixtape player. Build a tape, share a link.",
    siteName: "Mixtape & Static",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mixtape & Static",
    description: "A Y2K mixtape player. Build a tape, share a link.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
