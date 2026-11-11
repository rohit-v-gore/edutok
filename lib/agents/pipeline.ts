import "server-only";
import type { Clip } from "@/lib/types";
import { saveClip } from "@/lib/clip-store";
import { slugify } from "@/lib/format";
import { research } from "./research";
import { writeClips } from "./writer";
import type { Emit } from "./types";

export interface GenerateRequest {
  concept: string;
  company?: string;
  count?: number;
}

// research agent → writer agent → publisher. Every step reports progress through `emit`.
export async function generateClips(req: GenerateRequest, emit: Emit): Promise<Clip[]> {
  const concept = req.concept.trim().slice(0, 120);
  const company = (req.company ?? "").trim().slice(0, 60);
  const count = Math.max(1, Math.min(3, req.count ?? 2));
  if (!concept) throw new Error("Pick a concept first.");

  const notes = await research(concept, company, emit);
  const drafts = await writeClips(notes, count, emit);

  emit({ type: "status", agent: "publisher", message: `Publishing ${drafts.length} clip${drafts.length > 1 ? "s" : ""} to your feed` });
  const clips: Clip[] = [];
  for (const d of drafts) {
    const clip: Clip = {
      id: `${slugify(`${d.company}-${d.concept}`)}-${Math.random().toString(36).slice(2, 7)}`,
      ...d,
      channelId: "studio",
      sources: notes.sources,
      createdAt: new Date().toISOString(),
      generated: true,
    };
    await saveClip(clip);
    clips.push(clip);
    emit({ type: "clip", clip });
  }
  emit({ type: "done", clipIds: clips.map((c) => c.id) });
  return clips;
}
