import { getClip } from "@/lib/clip-store";
import { askTutor } from "@/lib/agents/tutor";
import { textStream } from "@/lib/ndjson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { clipId, question, history } = (await req.json().catch(() => ({}))) as {
    clipId?: string;
    question?: string;
    history?: { ai: boolean; text: string }[];
  };
  const clip = clipId ? await getClip(clipId) : undefined;
  if (!clip || !question?.trim()) return new Response("Missing clip or question.", { status: 400 });
  return textStream(askTutor(clip, question.trim().slice(0, 1000), (history ?? []).slice(-6)));
}
