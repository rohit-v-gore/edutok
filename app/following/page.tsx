import Link from "next/link";
import Feed from "@/components/feed/Feed";
import { allClips } from "@/lib/clip-store";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const clips = await allClips();
  return (
    <Feed
      clips={clips}
      mode="following"
      emptyState={
        <div className="max-w-xs text-center">
          <p className="text-4xl">👥</p>
          <h1 className="mt-3 text-lg font-bold">Follow channels to fill this feed</h1>
          <p className="mt-1 text-sm text-white/60">Tap the + under a channel&apos;s avatar on any clip, or browse channels in Explore.</p>
          <Link href="/explore" className="mt-5 inline-block rounded-md bg-lime px-5 py-2.5 font-semibold text-black">
            Explore channels
          </Link>
        </div>
      }
    />
  );
}
