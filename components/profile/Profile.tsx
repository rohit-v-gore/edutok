"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { Clip } from "@/lib/types";
import { useUser } from "@/lib/user-state";
import Avatar from "../Avatar";
import ClipGrid from "../ClipGrid";
import { BookmarkIcon, GridIcon, HeartIcon, LogoutIcon, SparkIcon } from "../icons";

const TABS = [
  { key: "liked", label: "Liked", Icon: HeartIcon },
  { key: "saved", label: "Saved", Icon: BookmarkIcon },
  { key: "made", label: "Made with AI", Icon: SparkIcon },
  { key: "history", label: "Watched", Icon: GridIcon },
] as const;

export default function Profile({ clips }: { clips: Clip[] }) {
  const { data: session, status } = useSession();
  const { likes, saves, follows, watched } = useUser();
  const params = useSearchParams();
  const router = useRouter();
  const tab = (params.get("tab") as (typeof TABS)[number]["key"]) ?? "liked";

  if (status === "loading") return null;
  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <Avatar name="?" color="#26262f" size={88} />
        <h1 className="mt-2 text-xl font-bold">Your learning profile</h1>
        <p className="max-w-xs text-sm text-white/60">Log in to keep your liked and saved clips, follow channels and track what you&apos;ve learned.</p>
        <Link href="/login?callbackUrl=/profile" className="mt-2 rounded-md bg-lime px-8 py-2.5 font-semibold text-black">
          Log in
        </Link>
      </div>
    );
  }

  const byId = new Map(clips.map((c) => [c.id, c]));
  const pick = (ids: string[]) => ids.slice().reverse().map((id) => byId.get(id)).filter((c): c is Clip => !!c);
  const lists = {
    liked: pick(likes),
    saved: pick(saves),
    made: clips.filter((c) => c.generated),
    history: pick(watched),
  };
  const minutes = Math.round(watched.reduce((n, id) => n + (byId.get(id)?.scenes.length ?? 5) * 9, 0) / 60);
  const user = session.user;

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar image={user?.image} name={user?.name} size={112} />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold">{user?.name ?? "Learner"}</h1>
            <p className="text-white/60">{user?.email ?? "Guest account · saved in this browser"}</p>
            <div className="mt-4 flex justify-center gap-5 text-sm sm:justify-start">
              <span><b>{follows.length}</b> <span className="text-white/50">following</span></span>
              <span><b>{likes.length}</b> <span className="text-white/50">likes</span></span>
              <span><b>{watched.length}</b> <span className="text-white/50">clips finished</span></span>
              <span><b>{minutes}</b> <span className="text-white/50">min learned</span></span>
            </div>
            <div className="mt-4 flex justify-center gap-2 sm:justify-start">
              <Link href="/studio" className="flex items-center gap-1.5 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
                <SparkIcon width={15} height={15} /> Make clips
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1.5 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 md:hidden">
                <LogoutIcon width={15} height={15} /> Log out
              </button>
            </div>
          </div>
        </div>

        <div className="no-scrollbar mt-8 flex overflow-x-auto border-b border-white/10">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => router.replace(`/profile?tab=${key}`)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-5 pb-2.5 text-sm font-semibold ${tab === key ? "border-white text-white" : "border-transparent text-white/45"}`}
            >
              <Icon width={16} height={16} filled={tab === key} /> {label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <ClipGrid
            clips={lists[tab] ?? []}
            empty={
              tab === "made" ? "Clips you create in the AI Studio appear here." : tab === "history" ? "Finish a clip to start your learning history." : `No ${tab} clips yet.`
            }
          />
        </div>
      </div>
    </div>
  );
}
