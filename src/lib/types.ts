export type Side = "A" | "B";

export interface Track {
  order: number;
  side: Side;
  videoId: string;
  title: string;
  artist: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

export interface Mixtape {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  tracks: Track[];
}

export interface SearchCandidate {
  videoId: string;
  title: string;
  artist: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

export interface SearchResult {
  items: SearchCandidate[];
  demo?: boolean;
  message?: string;
}
