import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Category, Scene, Visual } from "@/lib/types";
import { claude, claudeAvailable, FALLBACK_BETA, MODEL } from "./claude";
import { sentences } from "./wikipedia";
import type { Emit, ResearchNotes } from "./types";

export interface Draft {
  title: string;
  concept: string;
  company: string;
  category: Category;
  color: string;
  hashtags: string[];
  scenes: Scene[];
}

// Flat visual shape keeps the JSON schema simple for structured outputs; normalized below.
const VisualSchema = z.object({
  kind: z.enum(["title", "bullets", "flow", "stat", "compare", "code", "grid"]),
  emoji: z.string().nullable(),
  kicker: z.string().nullable(),
  items: z.array(z.string()).nullable(),
  nodes: z.array(z.string()).nullable(),
  value: z.string().nullable(),
  label: z.string().nullable(),
  left_title: z.string().nullable(),
  left_items: z.array(z.string()).nullable(),
  right_title: z.string().nullable(),
  right_items: z.array(z.string()).nullable(),
  lang: z.string().nullable(),
  code: z.string().nullable(),
  cells: z.array(z.string()).nullable(),
  highlight: z.array(z.number()).nullable(),
});

const ClipsSchema = z.object({
  clips: z.array(
    z.object({
      title: z.string(),
      concept: z.string(),
      company: z.string(),
      category: z.enum(["Infrastructure", "Data", "AI", "Hardware", "Product"]),
      color: z.string(),
      hashtags: z.array(z.string()),
      scenes: z.array(z.object({ caption: z.string(), narration: z.string(), visual: VisualSchema })),
    }),
  ),
});

const WRITER_SYSTEM = `You are EduTok's clip writer. You turn research notes into short-form vertical educational clips (like a 45-75 second explainer) about the engineering behind startups and technology.

Each clip has 5 scenes. Each scene has:
- caption: 2-6 word on-screen headline
- narration: 18-40 spoken words, conversational, concrete, no filler, no emojis
- visual: one of
  title {emoji, kicker} — hook or closing scene
  bullets {items: 3 short phrases}
  flow {nodes: 3-5 short steps of a process}
  stat {value: short number like "72" or "2015", label}
  compare {left_title, left_items, right_title, right_items} — before/after or A vs B, 1-3 items each
  code {lang, code: <= 6 short lines}
  grid {cells: 3-16 short labels, highlight: indexes to emphasize}
  Set every field the chosen kind doesn't use to null.

Structure: scene 1 is a hook (a problem or surprising fact), scenes 2-4 explain the mechanism step by step, scene 5 says why it matters / the takeaway.
Use only facts from the notes. Prefer numbers, names and mechanisms over adjectives. Make each clip understandable to a smart 16-year-old.
color: a hex brand-ish color for the company. hashtags: 3 lowercase tags without #.`;

export async function writeClips(notes: ResearchNotes, count: number, emit: Emit): Promise<Draft[]> {
  if (claudeAvailable() && notes.via === "claude-web") {
    try {
      return await writeWithClaude(notes, count, emit);
    } catch {
      emit({ type: "status", agent: "writer", message: "Writer model unavailable, using the offline template" });
    }
  }
  return [writeOffline(notes, emit)];
}

async function writeWithClaude(notes: ResearchNotes, count: number, emit: Emit): Promise<Draft[]> {
  emit({ type: "status", agent: "writer", message: `Scripting ${count} clip${count > 1 ? "s" : ""} from ${notes.facts.length} facts` });
  const res = await claude().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ClipsSchema) },
    system: WRITER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write ${count} distinct clip(s). If more than one, give each a different angle (e.g. the problem, the mechanism, the scaling story).\n\nConcept: ${notes.topic}\nCompany: ${notes.company}\n\nSUMMARY:\n${notes.summary}\n\nFACTS:\n${notes.facts.map((f) => `- ${f}`).join("\n")}`,
      },
    ],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("writer produced no clips");
  return res.parsed_output.clips.slice(0, count).map((c) => ({
    ...c,
    hashtags: c.hashtags.map((h) => h.replace(/^#/, "").toLowerCase()).slice(0, 4),
    scenes: c.scenes.slice(0, 7).map((s) => ({ caption: s.caption, narration: s.narration, visual: normalize(s.visual) })),
  }));
}

function normalize(v: z.infer<typeof VisualSchema>): Visual {
  const list = (a: string[] | null, n = 5) => (a ?? []).filter(Boolean).slice(0, n);
  switch (v.kind) {
    case "bullets":
      if (list(v.items).length) return { kind: "bullets", items: list(v.items) };
      break;
    case "flow":
      if (list(v.nodes).length >= 2) return { kind: "flow", nodes: list(v.nodes) };
      break;
    case "stat":
      if (v.value) return { kind: "stat", value: v.value, label: v.label ?? "" };
      break;
    case "compare":
      if (v.left_title && v.right_title)
        return { kind: "compare", left: { title: v.left_title, items: list(v.left_items, 3) }, right: { title: v.right_title, items: list(v.right_items, 3) } };
      break;
    case "code":
      if (v.code) return { kind: "code", lang: v.lang ?? "text", code: v.code.split("\n").slice(0, 8).join("\n") };
      break;
    case "grid":
      if (list(v.cells, 16).length) return { kind: "grid", cells: list(v.cells, 16), highlight: v.highlight ?? undefined };
      break;
  }
  return { kind: "title", emoji: v.emoji || "💡", kicker: v.kicker ?? undefined };
}

// ---------- offline template writer (no LLM) ----------

const EMOJI: [RegExp, string][] = [
  [/rocket|space|orbit|satellite/i, "🚀"],
  [/neural|learning|model|ai\b|intelligen/i, "🧠"],
  [/database|sql|storage|data/i, "🗄️"],
  [/network|internet|protocol|routing/i, "🌐"],
  [/payment|bank|money|finance/i, "💳"],
  [/chip|gpu|processor|semiconductor|hardware/i, "🔌"],
  [/battery|energy|electric|solar/i, "🔋"],
  [/security|crypt|encrypt/i, "🔐"],
  [/search|index|rank/i, "🔎"],
];

const PALETTE = ["#38bdf8", "#a78bfa", "#f59e0b", "#34d399", "#fb7185", "#22d3ee"];

function short(s: string, words: number) {
  const w = s.split(/\s+/);
  return w.length <= words ? s : `${w.slice(0, words).join(" ")}…`;
}

function keyPhrase(s: string) {
  // First clause, trimmed: good enough for bullet/flow labels.
  return short(s.split(/[,;:]| which | that | because /)[0].replace(/^(In|The|A|An)\s+/i, ""), 7);
}

function writeOffline(notes: ResearchNotes, emit: Emit): Draft {
  emit({ type: "status", agent: "writer", message: "Scripting a clip from the research notes" });
  const pool = notes.facts.length ? notes.facts : sentences(notes.summary);
  const at = (i: number) => pool[i % pool.length];
  const emoji = EMOJI.find(([re]) => re.test(`${notes.topic} ${notes.summary}`))?.[1] ?? "💡";
  const numberFact = pool.find((s) => /\b(1[89]\d\d|20\d\d|\d+(?:\.\d+)?\s?(%|million|billion|times|ms|GB|TB|x)\b)/i.test(s));
  const statValue = numberFact?.match(/\b(1[89]\d\d|20\d\d|\d+(?:\.\d+)?\s?(?:%|million|billion|times|ms|GB|TB|x)?)\b/i)?.[1];

  const scenes: Scene[] = [
    { caption: `What is ${short(notes.topic, 5)}?`, narration: short(at(0), 40), visual: { kind: "title", emoji, kicker: notes.company || "Explained" } },
    { caption: "The key ideas", narration: short(at(1), 40), visual: { kind: "bullets", items: [1, 2, 3].map((i) => keyPhrase(at(i))) } },
    { caption: "How it works", narration: short(at(2), 40), visual: { kind: "flow", nodes: [2, 3, 4].map((i) => keyPhrase(at(i))) } },
    statValue && numberFact
      ? { caption: "By the numbers", narration: short(numberFact, 40), visual: { kind: "stat", value: statValue, label: keyPhrase(numberFact) } }
      : { caption: "Go deeper", narration: short(at(3), 40), visual: { kind: "bullets", items: [4, 5].map((i) => keyPhrase(at(i))) } },
    {
      caption: "Why it matters",
      narration: `${short(at(4), 30)} That's why builders${notes.company ? ` at companies like ${notes.company}` : ""} care about ${notes.topic}.`,
      visual: { kind: "title", emoji: "🏁", kicker: "Takeaway" },
    },
  ];

  return {
    title: notes.company ? `How ${notes.company} uses ${notes.topic}` : `${notes.topic}, explained`,
    concept: notes.topic,
    company: notes.company || "Tech",
    category: /neural|learning|model|ai\b/i.test(notes.summary) ? "AI" : /data|database|storage/i.test(notes.summary) ? "Data" : /chip|rocket|hardware|battery/i.test(notes.summary) ? "Hardware" : "Infrastructure",
    color: PALETTE[notes.topic.length % PALETTE.length],
    hashtags: notes.topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2).slice(0, 2).concat("explained"),
    scenes,
  };
}
