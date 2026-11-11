"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Clip } from "@/lib/types";
import { useUser } from "@/lib/user-state";
import ClipSlot from "../player/ClipSlot";
import CommentsSheet from "./CommentsSheet";
import ShareSheet from "./ShareSheet";
import { ChevronDown, ChevronUp, SearchIcon } from "../icons";

interface Props {
  clips: Clip[];
  mode?: "foryou" | "following" | "single";
  startId?: string;
  emptyState?: React.ReactNode;
}

// Lightweight ranking until the ML recommender exists: unwatched first, followed channels
// and liked categories boosted, AI-studio clips the viewer made surfaced near the top.
function rank(clips: Clip[], watched: string[], follows: string[], likes: string[]): Clip[] {
  const likedCats = new Set(clips.filter((c) => likes.includes(c.id)).map((c) => c.category));
  const score = (c: Clip, i: number) =>
    (watched.includes(c.id) ? -100 : 0) +
    (follows.includes(c.channelId) ? 8 : 0) +
    (likedCats.has(c.category) ? 4 : 0) +
    (c.generated ? 6 : 0) -
    i * 0.01;
  return clips
    .map((c, i) => ({ c, s: score(c, i) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

export default function Feed({ clips, mode = "foryou", startId, emptyState }: Props) {
  const { ready, watched, follows, likes } = useUser();
  const [active, setActive] = useState(0);
  const [commentsFor, setCommentsFor] = useState<Clip | null>(null);
  const [shareFor, setShareFor] = useState<Clip | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Rank once per page load (re-ranking while scrolling would make clips jump).
  const [order, setOrder] = useState<Clip[]>(clips);
  const ranked = useRef(false);
  useEffect(() => {
    if (!ready || ranked.current) return;
    ranked.current = true;
    let list = clips;
    if (mode === "following") list = clips.filter((c) => follows.includes(c.channelId));
    if (mode !== "single") list = rank(list, watched, follows, likes);
    if (startId) {
      const i = list.findIndex((c) => c.id === startId);
      if (i > 0) list = [list[i], ...list.slice(0, i), ...list.slice(i + 1)];
    }
    setOrder(list);
  }, [ready, clips, mode, startId, watched, follows, likes]);

  // Which slot is on screen?
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll<HTMLElement>(".slot").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [order]);

  const go = useCallback((dir: 1 | -1) => {
    const root = scroller.current;
    if (!root) return;
    root.scrollBy({ top: dir * root.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commentsFor || shareFor) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "j") (e.preventDefault(), go(1));
      if (e.key === "ArrowUp" || e.key === "k") (e.preventDefault(), go(-1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, commentsFor, shareFor]);

  const list = useMemo(() => (ready ? order : clips), [ready, order, clips]);
  const visible = list;

  return (
    <div className="relative h-full">
      {mode !== "single" && <MobileTopTabs mode={mode} />}

      {ready && visible.length === 0 ? (
        <div className="flex h-full items-center justify-center p-8">{emptyState}</div>
      ) : (
        <div ref={scroller} className="feed">
          {visible.map((clip, i) => (
            <section key={clip.id} className="slot" data-index={i}>
              {Math.abs(i - active) <= 2 ? (
                <ClipSlot clip={clip} active={i === active && !commentsFor && !shareFor} onComments={setCommentsFor} onShare={setShareFor} />
              ) : (
                <div className="h-full w-full" />
              )}
            </section>
          ))}
        </div>
      )}

      {/* desktop up/down */}
      <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button onClick={() => go(-1)} disabled={active === 0} aria-label="Previous clip" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30">
          <ChevronUp />
        </button>
        <button onClick={() => go(1)} disabled={active >= visible.length - 1} aria-label="Next clip" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30">
          <ChevronDown />
        </button>
      </div>

      {commentsFor && <CommentsSheet clip={commentsFor} onClose={() => setCommentsFor(null)} />}
      {shareFor && <ShareSheet clip={shareFor} onClose={() => setShareFor(null)} />}
    </div>
  );
}

function MobileTopTabs({ mode }: { mode: "foryou" | "following" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-center bg-gradient-to-b from-black/50 to-transparent pb-6 pt-3 md:hidden" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <div className="pointer-events-auto flex items-center gap-5 text-[17px] font-bold">
        <Link href="/following" className={mode === "following" ? "text-white" : "text-white/60"}>
          Following
          {mode === "following" && <span className="mx-auto mt-1 block h-[3px] w-6 rounded bg-white" />}
        </Link>
        <Link href="/" className={mode === "foryou" ? "text-white" : "text-white/60"}>
          For You
          {mode === "foryou" && <span className="mx-auto mt-1 block h-[3px] w-6 rounded bg-white" />}
        </Link>
      </div>
      <Link href="/explore" aria-label="Search" className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 pb-3">
        <SearchIcon width={24} height={24} />
      </Link>
    </div>
  );
}
