"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { Clip } from "@/lib/types";
import { useUser } from "@/lib/user-state";
import { timeAgo } from "@/lib/format";
import Avatar from "../Avatar";
import Sheet from "./Sheet";
import { SendIcon, SparkIcon } from "../icons";

// Comments double as a Q&A thread: toggle "Ask AI" and the tutor answers about this clip.
export default function CommentsSheet({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const { data: session } = useSession();
  const { comments, addComment } = useUser();
  const [text, setText] = useState("");
  const [askAI, setAskAI] = useState(true);
  const [streaming, setStreaming] = useState<string | null>(null);
  const list = comments.filter((c) => c.clipId === clip.id);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [list.length, streaming]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q || streaming !== null) return;
    setText("");
    addComment({ clipId: clip.id, author: session?.user?.name ?? "You", avatar: session?.user?.image, text: q });
    if (!askAI) return;

    setStreaming("");
    let answer = "";
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clipId: clip.id, question: q, history: list.slice(-6).map((c) => ({ ai: !!c.ai, text: c.text })) }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += dec.decode(value, { stream: true });
        setStreaming(answer);
      }
    } catch {
      answer = answer || "I couldn't reach the tutor just now. Try again in a moment.";
    }
    addComment({ clipId: clip.id, author: "EduTok AI", text: answer.trim(), ai: true });
    setStreaming(null);
  }

  return (
    <Sheet
      title={`${list.length} comments`}
      onClose={onClose}
      footer={
        session ? (
          <form onSubmit={submit} className="border-t border-white/10 p-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
            <div className="mb-2 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAskAI((a) => !a)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${askAI ? "bg-lime text-black" : "bg-white/10 text-white/70"}`}
              >
                <SparkIcon width={13} height={13} strokeWidth={2.5} /> Ask AI {askAI ? "on" : "off"}
              </button>
              <span className="text-white/40">{askAI ? "The tutor replies to your comment." : "Post a plain comment."}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/[0.08] py-1.5 pl-4 pr-1.5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={askAI ? `Ask about ${clip.concept}…` : "Add comment…"}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
              />
              <button disabled={!text.trim() || streaming !== null} aria-label="Send" className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-black disabled:opacity-30">
                <SendIcon filled width={16} height={16} />
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-white/10 p-4 text-center text-sm">
            <Link href="/login" className="font-semibold text-lime">Log in</Link> to comment and ask the AI tutor.
          </div>
        )
      }
    >
      <div className="flex flex-col gap-5 p-4">
        {list.length === 0 && streaming === null && (
          <div className="py-10 text-center">
            <p className="text-3xl">💡</p>
            <p className="mt-2 font-semibold">No comments yet</p>
            <p className="mx-auto mt-1 max-w-[260px] text-sm text-white/50">Ask a question about {clip.concept} and the AI tutor will answer right here.</p>
          </div>
        )}
        {list.map((c) => (
          <CommentRow key={c.id} author={c.author} avatar={c.avatar} ai={c.ai} text={c.text} when={timeAgo(c.at)} />
        ))}
        {streaming !== null && <CommentRow author="EduTok AI" ai text={streaming} when="typing…" typing />}
        <div ref={bottom} />
      </div>
    </Sheet>
  );
}

function CommentRow({ author, avatar, ai, text, when, typing }: { author: string; avatar?: string | null; ai?: boolean; text: string; when: string; typing?: boolean }) {
  return (
    <div className="flex gap-3">
      {ai ? <Avatar emoji="✨" color="#c6ff3d" size={36} /> : <Avatar image={avatar} name={author} color="#7b61ff" size={36} />}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-white/60">
          {author} {ai && <span className="ml-1 rounded bg-lime/90 px-1 text-[10px] font-bold text-black">TUTOR</span>}
        </p>
        <p className={`mt-0.5 whitespace-pre-wrap text-[14.5px] leading-snug ${typing ? "caret" : ""}`}>{text}</p>
        <p className="mt-1 text-xs text-white/40">{when}</p>
      </div>
    </div>
  );
}
