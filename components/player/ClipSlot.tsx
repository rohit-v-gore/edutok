"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/types";
import { channelById } from "@/content/channels";
import { timeAgo, usableAccent } from "@/lib/format";
import { useUser } from "@/lib/user-state";
import { usePlayer } from "./usePlayer";
import SceneVisual from "./SceneVisual";
import ActionRail from "./ActionRail";
import { CaptionsIcon, HeartIcon, PlayIcon, VolumeIcon } from "../icons";

interface Props {
  clip: Clip;
  active: boolean;
  onComments: (clip: Clip) => void;
  onShare: (clip: Clip) => void;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  r: number;
}

export default function ClipSlot({ clip, active, onComments, onShare }: Props) {
  const { muted, setMuted, captions, setCaptions, like, markWatched } = useUser();
  const player = usePlayer(clip.scenes, active, muted);
  const scene = clip.scenes[player.idx];
  const accent = usableAccent(clip.color);
  const channel = channelById(clip.channelId);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);
  const tapTimer = useRef<number>();

  useEffect(() => {
    if (player.loops > 0) markWatched(clip.id);
  }, [player.loops, clip.id, markWatched]);

  function onTap(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-control]")) return;
    const now = Date.now();
    if (now - lastTap.current < 280) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = 0;
      const rect = e.currentTarget.getBoundingClientRect();
      const b = { id: now, x: e.clientX - rect.left, y: e.clientY - rect.top, r: Math.round(Math.random() * 40 - 20) };
      setBursts((bs) => [...bs, b]);
      window.setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 900);
      like(clip.id);
    } else {
      lastTap.current = now;
      tapTimer.current = window.setTimeout(() => player.setPaused((p) => !p), 260);
    }
  }

  const words = scene.narration.split(" ");
  const spoken = Math.ceil(player.frac * words.length * 1.08);

  return (
    <div className="relative flex h-full w-full items-center justify-center md:gap-5 md:py-5">
      <div
        onPointerUp={onTap}
        className="relative h-full w-full select-none overflow-hidden bg-ink md:aspect-[9/16] md:h-full md:w-auto md:max-w-full md:rounded-2xl md:border md:border-white/10"
        style={{
          background: "radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.09) 0%, transparent 60%), linear-gradient(180deg, #121212 0%, #000 100%)",
        }}
      >
        {/* subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* top controls */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-end gap-2 p-3 pt-14 md:pt-3">
          <button
            data-control
            onClick={() => setCaptions(!captions)}
            aria-label={captions ? "Hide captions" : "Show captions"}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur ${captions ? "text-white" : "text-white/50"}`}
          >
            <CaptionsIcon filled={captions} width={20} height={20} />
          </button>
          <button
            data-control
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Turn narration on" : "Mute narration"}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/40 px-3 text-xs font-semibold backdrop-blur"
          >
            <VolumeIcon muted={muted} width={18} height={18} />
            {muted && <span className="hidden sm:inline">Tap for voice</span>}
          </button>
        </div>

        {/* scene */}
        <div key={`${player.idx}-${player.loops}`} className="absolute inset-0 flex flex-col items-center pl-5 pr-[76px] pb-[150px] md:px-6 pt-24 md:pb-[140px] md:pt-16">
          <h2 className="anim-rise text-shadow max-w-[340px] text-center text-[26px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[28px]">
            {scene.caption}
          </h2>
          <div className="flex w-full flex-1 items-center justify-center py-4">
            <SceneVisual visual={scene.visual} accent={accent} />
          </div>
        </div>

        {/* karaoke subtitles */}
        {captions && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[118px] z-10 flex justify-center px-5 pr-20 md:bottom-[112px] md:pr-5">
            <p className="max-w-[360px] rounded-xl border border-white/[0.06] bg-black/60 px-3 py-2 text-center text-[13.5px] font-medium leading-snug backdrop-blur">
              {words.map((w, i) => (
                <span key={i} className={i < spoken ? "text-white" : "text-white/40"}>
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* info */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-5 pr-20 pt-10 md:pr-4">
          <Link data-control href={`/channel/${channel.id}`} className="text-[15px] font-bold hover:underline">
            @{channel.handle}
          </Link>
          <span className="ml-2 text-xs text-white/60">· {timeAgo(clip.createdAt)}</span>
          {clip.generated && <span className="ml-2 rounded border border-white/40 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-white/80">AI STUDIO</span>}
          <button data-control onClick={() => setExpanded((e) => !e)} className={`mt-1 block text-left text-sm leading-snug ${expanded ? "" : "line-clamp-2"}`}>
            <span className="font-semibold">{clip.title}</span>{" "}
            {clip.hashtags.map((h) => (
              <span key={h} className="font-semibold text-white/90">
                #{h}{" "}
              </span>
            ))}
          </button>
          {expanded && clip.sources.length > 0 && (
            <div data-control className="mt-2 flex flex-col gap-1">
              {clip.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="truncate text-xs text-white/70 underline underline-offset-2 hover:text-white">
                  📎 {s.title}
                </a>
              ))}
            </div>
          )}
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-white/85">
            <span className="grayscale">📚</span>
            <span className="truncate">
              {clip.concept} · {clip.company}
            </span>
          </p>
        </div>

        {/* segmented progress */}
        <div data-control className="absolute inset-x-0 bottom-0 z-20 flex gap-1 px-2 pb-1">
          {clip.scenes.map((_, i) => (
            <button key={i} aria-label={`Jump to part ${i + 1}`} onClick={() => player.seek(i)} className="group flex-1 py-1.5">
              <div className="h-[3px] overflow-hidden rounded-full bg-white/25 group-hover:h-[5px]">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${i < player.idx ? 100 : i === player.idx ? player.frac * 100 : 0}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* paused */}
        {player.paused && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <PlayIcon width={72} height={72} className="anim-pop text-white/80 drop-shadow-xl" />
          </div>
        )}

        {/* double-tap hearts */}
        {bursts.map((b) => (
          <HeartIcon
            key={b.id}
            filled
            width={96}
            height={96}
            className="pointer-events-none absolute z-30 text-heart drop-shadow-2xl"
            style={{ left: b.x, top: b.y, animation: "heart-burst 0.9s ease-out forwards", ["--r" as string]: `${b.r}deg` }}
          />
        ))}

        {/* mobile rail overlays the card */}
        <div className="absolute bottom-24 right-2 z-20 md:hidden" data-control>
          <ActionRail clip={clip} onComments={() => onComments(clip)} onShare={() => onShare(clip)} />
        </div>
      </div>

      {/* desktop rail sits beside the card */}
      <div className="hidden self-end pb-4 md:block">
        <ActionRail clip={clip} onComments={() => onComments(clip)} onShare={() => onShare(clip)} />
      </div>
    </div>
  );
}
