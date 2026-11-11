import { allClips } from "@/lib/clip-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await allClips());
}
