"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Clip } from "@/lib/types";
import { channels } from "@/content/channels";
import { ideas } from "@/content/ideas";
import { useUser } from "@/lib/user-state";
import ClipGrid from "../ClipGrid";
import Avatar from "../Avatar";
import { SearchIcon, SparkIcon } from "../icons";

const CATS: (Category | "All")[] = ["All", "Infrastructure", "Data", "AI", "Hardware", "Product"];

export default function Explore({ clips }: { clips: Clip[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<Category | "All">("All");
  const { follows, toggle } = useUser();

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return clips.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!terms.length) return true;
      const hay = `${c.title} ${c.concept} ${c.company} ${c.hashtags.join(" ")} ${c.scenes.map((s) => s.caption).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [clips, q, cat]);

  const companies = useMemo(() => [...new Set(clips.map((c) => c.company))].slice(0, 14), [clips]);

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 px-4 pb-3 pt-3 backdrop-blur" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.replace(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
          }}
          className="mx-auto flex max-w-5xl items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5"
        >
          <SearchIcon width={18} height={18} className="text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search concepts, companies, #tags"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/40"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-xs text-white/50">
              Clear
            </button>
          )}
        </form>
        <div className="no-scrollbar mx-auto mt-3 flex max-w-5xl gap-2 overflow-x-auto">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-semibold ${cat === c ? "bg-white text-black" : "bg-white/[0.08] text-white/80 hover:bg-white/15"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5">
        {!q && cat === "All" && (
          <>
            <section className="mb-7">
              <h2 className="mb-3 text-lg font-bold">Channels</h2>
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
                {channels.map((ch) => {
                  const on = follows.includes(ch.id);
                  return (
                    <div key={ch.id} className="flex w-40 shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                      <Link href={`/channel/${ch.id}`} className="flex flex-col items-center">
                        <Avatar emoji={ch.avatar} color={ch.color} size={64} />
                        <p className="mt-2 text-sm font-bold">{ch.name}</p>
                        <p className="text-xs text-white/50">@{ch.handle}</p>
                      </Link>
                      <button
                        onClick={() => toggle("follows", ch.id)}
                        className={`mt-3 w-full rounded-md py-1.5 text-sm font-semibold ${on ? "bg-white/10 text-white" : "bg-lime text-black"}`}
                      >
                        {on ? "Following" : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mb-7">
              <h2 className="mb-3 text-lg font-bold">Trending companies</h2>
              <div className="flex flex-wrap gap-2">
                {companies.map((c) => (
                  <button key={c} onClick={() => setQ(c)} className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white/10">
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold">
            {q ? `Results for “${q}”` : cat === "All" ? "All clips" : cat}
            <span className="ml-2 text-sm font-normal text-white/40">{results.length}</span>
          </h2>
          <ClipGrid
            clips={results}
            empty={
              <div className="flex flex-col items-center gap-3">
                <p>No clips about that yet.</p>
                <Link href="/studio" className="flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 font-semibold text-black">
                  <SparkIcon width={16} height={16} /> Ask the AI Studio to make one
                </Link>
              </div>
            }
          />
        </section>

        {!q && cat === "All" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5">
            <h2 className="text-lg font-bold">Not seeing your topic?</h2>
            <p className="mt-1 text-sm text-white/60">The AI Studio can research and script clips on anything, like {ideas.slice(0, 3).map((i) => i.concept).join(", ")}…</p>
            <Link href="/studio" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              <SparkIcon width={16} height={16} /> Open AI Studio
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
