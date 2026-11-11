import { chat, type ChatTurn } from "@/lib/agents/guide";
import { ndjsonStream } from "@/lib/ndjson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { history } = (await req.json().catch(() => ({}))) as { history?: ChatTurn[] };
  const turns = (history ?? [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string" && t.text.trim())
    .slice(-20)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 2000) }));
  if (!turns.length || turns[turns.length - 1].role !== "user") return Response.json({ error: "Send a message." }, { status: 400 });
  return ndjsonStream(async (send) => {
    for await (const ev of chat(turns)) send(ev);
  });
}
