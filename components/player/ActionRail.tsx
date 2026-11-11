"use client";

import Link from "next/link";
import { useState } from "react";
import type { Clip } from "@/lib/types";
import { channelById } from "@/content/channels";
import { baseCounts, compact } from "@/lib/format";
import { useUser } from "@/lib/user-state";
import Avatar from "../Avatar";
import { BookmarkIcon, CommentIcon, HeartIcon, PlusIcon, ShareIcon } from "../icons";

export default function ActionRail({ clip, onComments, onShare }: { clip: Clip; onComments: () => void; onShare: () => void }) {
  const { likes, saves, follows, comments, toggle } = useUser();
  const channel = channelById(clip.channelId);
  const base = baseCounts(clip.id);
  const liked = likes.includes(clip.id);
  const saved = saves.includes(clip.id);
  const following = follows.includes(channel.id);
  const myComments = comments.filter((c) => c.clipId === clip.id).length;
  const [pop, setPop] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-5">
      <div className="relative mb-2">
        <Link href={`/channel/${channel.id}`} aria-label={`Open ${channel.name}`}>
          <Avatar emoji={channel.avatar} color={channel.color} size={48} ring />
        </Link>
        {!following && (
          <button
            onClick={() => toggle("follows", channel.id)}
            aria-label={`Follow ${channel.handle}`}
            className="absolute -bottom-2.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-lime text-black"
          >
            <PlusIcon width={13} height={13} strokeWidth={3.5} />
          </button>
        )}
      </div>

      <RailButton
        label={compact(base.likes + (liked ? 1 : 0))}
        aria={liked ? "Unlike" : "Like"}
        onClick={() => {
          toggle("likes", clip.id);
          setPop((p) => p + 1);
        }}
      >
        <HeartIcon key={pop} filled={liked} width={30} height={30} className={`${liked ? "anim-like text-heart" : "text-white"}`} stroke={liked ? "none" : "currentColor"} />
      </RailButton>

      <RailButton label={compact(base.comments + myComments)} aria="Comments" onClick={onComments}>
        <CommentIcon filled width={28} height={28} />
      </RailButton>

      <RailButton label={compact(base.saves + (saved ? 1 : 0))} aria={saved ? "Remove from saved" : "Save"} onClick={() => toggle("saves", clip.id)}>
        <BookmarkIcon filled width={27} height={27} className={saved ? "text-[#facc15]" : "text-white"} stroke="none" />
      </RailButton>

      <RailButton label={compact(base.shares)} aria="Share" onClick={onShare}>
        <ShareIcon filled width={28} height={28} stroke="none" />
      </RailButton>

      <Link
        href={`/explore?q=${encodeURIComponent(clip.concept)}`}
        aria-label={`More on ${clip.concept}`}
        className="anim-spin mt-1 flex h-11 w-11 items-center justify-center rounded-full border-[6px] border-zinc-800 bg-zinc-900 text-lg grayscale"
      >
        {channel.avatar}
      </Link>
    </div>
  );
}

function RailButton({ children, label, aria, onClick }: { children: React.ReactNode; label: string; aria: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={aria} className="flex flex-col items-center gap-1 text-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm md:bg-white/[0.08] md:hover:bg-white/[0.14]">
        {children}
      </span>
      <span className="text-shadow text-xs font-semibold">{label}</span>
    </button>
  );
}
