import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Feed from "@/components/feed/Feed";
import { allClips, getClip } from "@/lib/clip-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const clip = await getClip(params.id);
  return clip ? { title: `${clip.title} · EduTok`, description: `${clip.concept} at ${clip.company}: ${clip.scenes[0]?.narration}` } : {};
}

// A shared link opens that clip first, then continues into the regular feed.
export default async function ClipPage({ params }: { params: { id: string } }) {
  const clip = await getClip(params.id);
  if (!clip) notFound();
  return <Feed clips={await allClips()} mode="foryou" startId={clip.id} />;
}
