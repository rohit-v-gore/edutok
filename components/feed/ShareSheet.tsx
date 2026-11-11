"use client";

import { useState } from "react";
import type { Clip } from "@/lib/types";
import Sheet from "./Sheet";
import { LinkIcon } from "../icons";

export default function ShareSheet({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/clip/${clip.id}` : `/clip/${clip.id}`;
  const text = `${clip.title}: learn ${clip.concept} in under a minute on EduTok`;

  const targets = [
    { label: "X", bg: "#000", glyph: "𝕏", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { label: "LinkedIn", bg: "#0a66c2", glyph: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", bg: "#25d366", glyph: "✆", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { label: "Email", bg: "#52525b", glyph: "✉", href: `mailto:?subject=${encodeURIComponent(clip.title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  function downloadNotes() {
    const body = [
      `# ${clip.title}`,
      `${clip.concept} · ${clip.company}`,
      "",
      ...clip.scenes.map((s, i) => `${i + 1}. ${s.caption}\n   ${s.narration}`),
      "",
      "Sources:",
      ...clip.sources.map((s) => `- ${s.title}: ${s.url}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/markdown" }));
    a.download = `${clip.id}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <Sheet title="Share to" onClose={onClose}>
      <div className="p-5">
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <ShareTarget label="More" bg="#3f3f46" glyph="⋯" onClick={() => navigator.share({ title: clip.title, text, url }).catch(() => {})} />
          )}
          <ShareTarget label={copied ? "Copied!" : "Copy link"} bg="#c6ff3d" glyph={<LinkIcon width={22} height={22} className="text-white" />} onClick={copy} />
          {targets.map((t) => (
            <ShareTarget key={t.label} label={t.label} bg={t.bg} glyph={t.glyph} href={t.href} />
          ))}
          <ShareTarget label="Study notes" bg="#7b61ff" glyph="📝" onClick={downloadNotes} />
        </div>
        <p className="mt-4 truncate rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white/50">{url}</p>
      </div>
    </Sheet>
  );
}

function ShareTarget({ label, bg, glyph, href, onClick }: { label: string; bg: string; glyph: React.ReactNode; href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-xl font-semibold text-white grayscale transition hover:bg-white/15" data-bg={bg}>
        {glyph}
      </span>
      <span className="text-xs text-white/70">{label}</span>
    </>
  );
  const cls = "flex w-16 shrink-0 flex-col items-center gap-1.5";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
