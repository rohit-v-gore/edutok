// A clip is a short "video" made of animated scenes with narration + captions.
// Scenes are rendered by components/player/* so new clips need no video files.

export type Visual =
  | { kind: "title"; emoji: string; kicker?: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "flow"; nodes: string[] }
  | { kind: "stat"; value: string; label: string }
  | { kind: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { kind: "code"; lang: string; code: string }
  | { kind: "grid"; cells: string[]; highlight?: number[] };

export interface Scene {
  caption: string; // big on-screen headline
  narration: string; // spoken + subtitled
  visual: Visual;
}

export interface Source {
  title: string;
  url: string;
}

export type Category = "Infrastructure" | "Data" | "AI" | "Hardware" | "Product";

export interface Clip {
  id: string;
  title: string;
  concept: string;
  company: string;
  channelId: string;
  category: Category;
  color: string; // accent / background hue
  scenes: Scene[];
  hashtags: string[];
  sources: Source[];
  createdAt: string;
  generated?: boolean; // made by the AI studio
}

export interface Channel {
  id: string;
  handle: string;
  name: string;
  avatar: string; // emoji
  bio: string;
  color: string;
}
