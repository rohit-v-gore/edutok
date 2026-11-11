import { Suspense } from "react";
import Profile from "@/components/profile/Profile";
import { allClips } from "@/lib/clip-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · EduTok" };

export default async function ProfilePage() {
  return (
    <Suspense>
      <Profile clips={await allClips()} />
    </Suspense>
  );
}
