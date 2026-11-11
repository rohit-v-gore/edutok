"use client";

import type { Channel, Clip } from "@/lib/types";
import { useUser } from "@/lib/user-state";
import { baseCounts, compact } from "@/lib/format";
import Avatar from "../Avatar";
import ClipGrid from "../ClipGrid";

export default function ChannelView({ channel, clips }: { channel: Channel; clips: Clip[] }) {
  const { follows, toggle } = useUser();
  const on = follows.includes(channel.id);
  const likes = clips.reduce((n, c) => n + baseCounts(c.id).likes, 0);
  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar emoji={channel.avatar} color={channel.color} size={112} />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold">{channel.handle}</h1>
            <p className="text-white/70">{channel.name}</p>
            <button onClick={() => toggle("follows", channel.id)} className={`mt-3 w-40 rounded-md py-2 font-semibold ${on ? "bg-white/10" : "bg-lime text-black"}`}>
              {on ? "Following" : "Follow"}
            </button>
            <div className="mt-4 flex justify-center gap-5 text-sm sm:justify-start">
              <span><b>{clips.length}</b> <span className="text-white/50">clips</span></span>
              <span><b>{compact(4200 + (likes % 90000))}</b> <span className="text-white/50">followers</span></span>
              <span><b>{compact(likes)}</b> <span className="text-white/50">likes</span></span>
            </div>
            <p className="mt-3 max-w-md text-sm text-white/80">{channel.bio}</p>
          </div>
        </div>
        <div className="mt-8 border-b border-white/10">
          <span className="inline-block border-b-2 border-white px-6 pb-2.5 text-sm font-semibold">Clips</span>
        </div>
        <div className="mt-3">
          <ClipGrid clips={clips} empty="No clips on this channel yet." />
        </div>
      </div>
    </div>
  );
}
