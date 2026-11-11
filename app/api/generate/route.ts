import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateClips } from "@/lib/agents/pipeline";
import { ndjsonStream } from "@/lib/ndjson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Log in to create clips." }, { status: 401 });
  const { concept, company, count } = (await req.json().catch(() => ({}))) as { concept?: string; company?: string; count?: number };
  if (!concept?.trim()) return Response.json({ error: "Pick a concept first." }, { status: 400 });
  return ndjsonStream(async (send) => {
    await generateClips({ concept, company, count }, send);
  });
}
