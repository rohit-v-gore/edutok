import Link from "next/link";
import type { Clip } from "@/lib/types";
import { baseCounts, compact, usableAccent } from "@/lib/format";
import { PlayIcon } from "./icons";

export function ClipThumb({ clip, badge }: { clip: Clip; badge?: string }) {
  const accent = usableAccent(clip.color);
  const first = clip.scenes[0];
  const emoji = first?.visual.kind === "title" ? first.visual.emoji : "💡";
  return (
    <Link
      href={`/clip/${clip.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-white/[0.07] bg-ink-3 transition hover:border-white/25"
      style={{ background: `radial-gradient(90% 70% at 20% 0%, ${accent}1f, transparent 65%), linear-gradient(180deg, #161616, #050505)` }}
    >
      <div className="absolute inset-0 flex flex-col p-2.5">
        <span className="text-[26px] grayscale transition group-hover:scale-110">{emoji}</span>
        <p className="mt-auto line-clamp-3 text-[13px] font-semibold leading-tight tracking-tight text-shadow">{clip.title}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-1.5 pt-6 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100">
        <PlayIcon width={11} height={11} /> {compact(baseCounts(clip.id).likes * 7)}
      </div>
      {(badge || clip.generated) && (
        <span className="absolute right-1.5 top-1.5 rounded border border-white/40 bg-black/50 px-1.5 py-0.5 text-[8.5px] font-semibold tracking-[0.12em] text-white/85">{badge ?? "AI"}</span>
      )}
    </Link>
  );
}

export default function ClipGrid({ clips, empty }: { clips: Clip[]; empty?: React.ReactNode }) {
  if (!clips.length) return <div className="py-16 text-center text-sm text-white/50">{empty ?? "Nothing here yet."}</div>;
  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5 xl:grid-cols-6">
      {clips.map((c) => (
        <ClipThumb key={c.id} clip={c} />
      ))}
    </div>
  );
}
