import { Suspense } from "react";
import Explore from "@/components/explore/Explore";
import { allClips } from "@/lib/clip-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore · EduTok" };

export default async function ExplorePage() {
  const clips = await allClips();
  return (
    <Suspense>
      <Explore clips={clips} />
    </Suspense>
  );
}
