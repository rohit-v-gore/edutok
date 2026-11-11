import Feed from "@/components/feed/Feed";
import { allClips } from "@/lib/clip-store";

export const dynamic = "force-dynamic";

export default async function ForYouPage() {
  const clips = await allClips();
  return <Feed clips={clips} mode="foryou" />;
}
