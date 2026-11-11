"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { Clip, Source } from "@/lib/types";
import { ideas } from "@/content/ideas";
import { usableAccent } from "@/lib/format";
import Avatar from "../Avatar";
import { Logo, SendIcon, SparkIcon } from "../icons";

interface Suggestion {
  concept: string;
  company: string;
  hook: string;
}
interface Msg {
  role: "user" | "assistant";
  text: string;
  suggestions?: Suggestion[];
}
interface Step {
  agent: "research" | "writer" | "publisher";
  message: string;
}
interface Job {
  id: number;
  concept: string;
  company: string;
  steps: Step[];
  sources: Source[];
  facts: string[];
  via?: string;
  clips: Clip[];
  error?: string;
  done: boolean;
}

const GREETING: Msg = {
  role: "assistant",
  text: "Hey! I'm the EduTok studio guide. Tell me what you're curious about, like AI, rockets, payments or how apps handle millions of users, and I'll help you pick a concept. Then my research agents read the web and turn it into clips for your feed.",
  suggestions: ideas.slice(0, 4).map(({ concept, company, hook }) => ({ concept, company, hook })),
};

async function* readNdjson(res: Response) {
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line);
    }
  }
}

export default function Studio() {
  const { data: session, status } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [count, setCount] = useState(2);
  const [jobs, setJobs] = useState<Job[]>([]);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, jobs]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || thinking) return;
    setInput("");
    const history = [...msgs, { role: "user" as const, text: t }];
    setMsgs([...history, { role: "assistant", text: "" }]);
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Suggestions are folded into text so the model remembers what it offered.
        body: JSON.stringify({
          history: history.slice(1).map((m) => ({
            role: m.role,
            text: m.suggestions ? `${m.text}\n(Options shown: ${m.suggestions.map((s) => `${s.concept} at ${s.company}`).join("; ")})` : m.text,
          })),
        }),
      });
      for await (const ev of readNdjson(res)) {
        setMsgs((m) => {
          const copy = [...m];
          const last = { ...copy[copy.length - 1] };
          if (ev.type === "text") last.text += ev.text;
          if (ev.type === "suggestions") last.suggestions = ev.items;
          if (ev.type === "error") last.text = last.text || ev.message;
          copy[copy.length - 1] = last;
          return copy;
        });
      }
    } catch {
      setMsgs((m) => [...m.slice(0, -1), { role: "assistant", text: "I lost my connection for a second. Try again?" }]);
    } finally {
      setThinking(false);
    }
  }

  async function make(concept: string, company: string) {
    if (!session) return;
    const job: Job = { id: Date.now(), concept, company, steps: [], sources: [], facts: [], clips: [], done: false };
    setJobs((j) => [...j, job]);
    const update = (fn: (j: Job) => Job) => setJobs((all) => all.map((x) => (x.id === job.id ? fn(x) : x)));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ concept, company, count }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        update((j) => ({ ...j, error: err.error, done: true }));
        return;
      }
      for await (const ev of readNdjson(res)) {
        update((j) => {
          switch (ev.type) {
            case "status":
              return { ...j, steps: [...j.steps, { agent: ev.agent, message: ev.message }] };
            case "source":
              return { ...j, sources: [...j.sources, ev.source] };
            case "notes":
              return { ...j, facts: ev.facts, via: ev.via };
            case "clip":
              return { ...j, clips: [...j.clips, ev.clip] };
            case "error":
              return { ...j, error: ev.message, done: true };
            case "done":
              return { ...j, done: true };
            default:
              return j;
          }
        });
      }
    } catch {
      update((j) => ({ ...j, error: "Connection lost while the agents were working.", done: true }));
    }
  }

  const busy = jobs.some((j) => !j.done);

  return (
    <div className="flex h-full flex-col bg-ink">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime to-violet text-black">
          <SparkIcon width={20} height={20} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold leading-tight">AI Studio</h1>
          <p className="truncate text-xs text-white/50">Pick a concept · agents research the web · clips land in your feed</p>
        </div>
        <label className="ml-auto flex items-center gap-2 text-xs text-white/60">
          Clips
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="rounded-md bg-white/10 px-2 py-1 text-white outline-none">
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="mt-0.5 shrink-0">
                  <Logo size={30} />
                </div>
              )}
              <div className={`flex max-w-[85%] flex-col gap-3 ${m.role === "user" ? "items-end" : ""}`}>
                {(m.text || m.role === "user") && (
                  <p className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${m.role === "user" ? "rounded-br-md bg-violet text-white" : "rounded-tl-md bg-white/[0.07]"}`}>
                    {m.text}
                  </p>
                )}
                {m.role === "assistant" && !m.text && thinking && i === msgs.length - 1 && <Dots />}
                {m.suggestions && (
                  <div className="no-scrollbar -mr-4 flex snap-x gap-2 overflow-x-auto pr-4 sm:mr-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pr-0">
                    {m.suggestions.map((s) => (
                      <SuggestionCard key={`${s.concept}-${s.company}`} s={s} disabled={!session || busy} onMake={() => make(s.concept, s.company)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}

          {status !== "loading" && !session && (
            <div className="rounded-2xl border border-lime/30 bg-lime/[0.06] p-4 text-sm">
              <Link href="/login?callbackUrl=/studio" className="font-semibold text-lime">
                Log in
              </Link>{" "}
              to send the research agents out and publish clips to your feed. You can chat without logging in.
            </div>
          )}
          <div ref={end} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-white/10 bg-ink px-4 py-3"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <div className="flex flex-1 items-center rounded-3xl bg-white/[0.07] px-4 py-2.5 focus-within:ring-1 focus-within:ring-lime/60">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="What do you want to learn? e.g. how Spotify recommends songs"
              className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-[15px] outline-none placeholder:text-white/35"
            />
          </div>
          {session && input.trim() && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const t = input.trim();
                setMsgs((m) => [...m, { role: "user", text: `Make clips about: ${t}` }]);
                setInput("");
                make(t, "");
              }}
              className="hidden h-11 shrink-0 items-center gap-1.5 rounded-full border border-lime px-4 text-sm font-semibold text-lime disabled:opacity-40 sm:flex"
            >
              <SparkIcon width={16} height={16} /> Make clips
            </button>
          )}
          <button disabled={!input.trim() || thinking} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-black disabled:opacity-30">
            <SendIcon filled width={20} height={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex gap-1 rounded-2xl bg-white/[0.07] px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function SuggestionCard({ s, onMake, disabled }: { s: Suggestion; onMake: () => void; disabled: boolean }) {
  return (
    <div className="flex w-[220px] shrink-0 snap-start flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:w-auto">
      <p className="text-[15px] font-bold leading-tight">{s.concept}</p>
      <p className="mt-0.5 text-xs font-semibold text-lime">{s.company}</p>
      <p className="mt-1.5 flex-1 text-[13px] leading-snug text-white/60">{s.hook}</p>
      <button onClick={onMake} disabled={disabled} className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-sm font-semibold text-black disabled:opacity-40">
        <SparkIcon width={14} height={14} strokeWidth={2.5} /> Make clips
      </button>
    </div>
  );
}

const AGENTS: { key: Step["agent"]; label: string; emoji: string }[] = [
  { key: "research", label: "Research agent", emoji: "🔎" },
  { key: "writer", label: "Script writer", emoji: "✍️" },
  { key: "publisher", label: "Publisher", emoji: "📤" },
];

function JobCard({ job }: { job: Job }) {
  const current = job.steps.at(-1)?.agent;
  return (
    <div className="anim-rise rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Building clips</span>
        <span className="truncate text-sm font-bold">
          {job.concept}
          {job.company && <span className="text-white/50"> · {job.company}</span>}
        </span>
        {!job.done && <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-lime" />}
      </div>

      <ol className="flex flex-col gap-3">
        {AGENTS.map((a) => {
          const steps = job.steps.filter((s) => s.agent === a.key);
          const state = steps.length === 0 ? "todo" : current === a.key && !job.done ? "doing" : "done";
          return (
            <li key={a.key} className="flex gap-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${state === "todo" ? "bg-white/5 opacity-40" : state === "doing" ? "bg-lime/20 ring-1 ring-lime" : "bg-white/10"}`}>
                {a.emoji}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className={`text-sm font-semibold ${state === "todo" ? "text-white/40" : ""}`}>
                  {a.label} {state === "done" && <span className="text-lime">✓</span>}
                </p>
                {steps.slice(-3).map((s, i) => (
                  <p key={i} className="truncate text-xs text-white/55">
                    {s.message}
                  </p>
                ))}
                {a.key === "research" && job.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {job.sources.slice(0, 6).map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="max-w-[220px] truncate rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/70 hover:text-white">
                        📎 {s.title}
                      </a>
                    ))}
                  </div>
                )}
                {a.key === "research" && job.facts.length > 0 && (
                  <p className="mt-1 text-[11px] text-white/40">
                    {job.facts.length} facts gathered via {job.via === "claude-web" ? "Claude web search" : "Wikipedia (offline mode)"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {job.error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{job.error}</p>}

      {job.clips.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {job.clips.map((c) => (
            <Link key={c.id} href={`/clip/${c.id}`} className="group relative aspect-[9/14] overflow-hidden rounded-xl" style={{ background: `linear-gradient(160deg, ${usableAccent(c.color)}, #0b0b0f 75%)` }}>
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <span className="text-3xl">{c.scenes[0]?.visual.kind === "title" ? c.scenes[0].visual.emoji : "✨"}</span>
                <div>
                  <p className="line-clamp-3 text-sm font-bold leading-tight">{c.title}</p>
                  <p className="mt-1 text-[11px] text-white/60">{c.scenes.length} scenes · tap to watch</p>
                </div>
              </div>
              <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/5" />
            </Link>
          ))}
        </div>
      )}
      {job.done && job.clips.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
          <Avatar emoji="✨" color="#c6ff3d" size={18} /> Published to @edutok.studio and boosted in your For You feed.
        </div>
      )}
    </div>
  );
}
