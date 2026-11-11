import type { Clip, Source } from "@/lib/types";

export interface ResearchNotes {
  topic: string;
  company: string;
  summary: string; // condensed notes the writer works from
  facts: string[];
  sources: Source[];
  via: "claude-web" | "wikipedia";
}

// Progress events streamed to the studio UI as newline-delimited JSON.
export type AgentEvent =
  | { type: "status"; agent: "research" | "writer" | "publisher"; message: string }
  | { type: "source"; source: Source }
  | { type: "notes"; facts: string[]; via: ResearchNotes["via"] }
  | { type: "clip"; clip: Clip }
  | { type: "error"; message: string }
  | { type: "done"; clipIds: string[] };

export type Emit = (e: AgentEvent) => void;
