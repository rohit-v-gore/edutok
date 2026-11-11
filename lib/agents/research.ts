import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { Source } from "@/lib/types";
import { claude, claudeAvailable, FALLBACK_BETA, isAuthError, MODEL } from "./claude";
import { readWikipedia, searchWikipedia, sentences } from "./wikipedia";
import type { Emit, ResearchNotes } from "./types";

const RESEARCH_SYSTEM = `You are EduTok's research agent. EduTok makes 60-second educational clips about the engineering and technology behind successful startups and major technological advances.

Research the requested concept on the web. Prefer primary sources: company engineering blogs, original papers, official docs, then reputable press. Read at least two sources before concluding.

Finish with plain-text notes in exactly this shape:
SUMMARY: 3-5 sentences explaining how the concept works and why it mattered to the company.
FACTS:
- one concrete, verifiable fact per line (numbers, dates, names, mechanisms), 6-10 lines
Only include facts your sources support. If sources disagree, say so in the fact.`;

export async function research(topic: string, company: string, emit: Emit): Promise<ResearchNotes> {
  if (claudeAvailable()) {
    try {
      return await researchWithClaude(topic, company, emit);
    } catch (e) {
      emit({ type: "status", agent: "research", message: isAuthError(e) ? "Claude credentials rejected, switching to offline research" : "Web agent failed, switching to offline research" });
    }
  }
  return researchWithWikipedia(topic, company, emit);
}

async function researchWithClaude(topic: string, company: string, emit: Emit): Promise<ResearchNotes> {
  emit({ type: "status", agent: "research", message: `Searching the web for how ${company || "startups"} use ${topic}` });
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `Concept: ${topic}\nCompany or context: ${company || "pick the most instructive real company example"}` },
  ];
  const sources = new Map<string, Source>();
  let final: Anthropic.Beta.BetaMessage | null = null;

  // Server tools run on Anthropic's side; a long turn can pause and must be sent back to continue.
  for (let round = 0; round < 4; round++) {
    const msg = await claude().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: RESEARCH_SYSTEM,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 5 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 4 },
      ],
      messages,
    });

    for (const block of msg.content) {
      if (block.type === "server_tool_use") {
        const input = block.input as { query?: string; url?: string };
        emit({ type: "status", agent: "research", message: input.query ? `Searching "${input.query}"` : `Reading ${input.url}` });
      } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const r of block.content.slice(0, 3)) {
          if (r.type === "web_search_result" && !sources.has(r.url)) {
            sources.set(r.url, { title: r.title, url: r.url });
            emit({ type: "source", source: { title: r.title, url: r.url } });
          }
        }
      }
    }

    if (msg.stop_reason === "refusal") throw new Error("research refused");
    if (msg.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: msg.content });
      continue;
    }
    final = msg;
    break;
  }
  if (!final) throw new Error("research did not finish");

  const text = final.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  const summary = /SUMMARY:\s*([\s\S]*?)(?:\nFACTS:|$)/i.exec(text)?.[1]?.trim() ?? text.slice(0, 1200);
  const facts = (/FACTS:\s*([\s\S]*)$/i.exec(text)?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);

  emit({ type: "notes", facts, via: "claude-web" });
  return { topic, company, summary, facts, sources: [...sources.values()].slice(0, 6), via: "claude-web" };
}

async function researchWithWikipedia(topic: string, company: string, emit: Emit): Promise<ResearchNotes> {
  emit({ type: "status", agent: "research", message: `Searching Wikipedia for "${topic}"` });
  const queries = [topic, company ? `${company} ${topic}` : ""].filter(Boolean);
  const titles = new Set<string>();
  for (const q of queries) for (const t of await searchWikipedia(q, 2)) titles.add(t);
  if (company) titles.add(company);

  const pages = [];
  for (const t of [...titles].slice(0, 3)) {
    emit({ type: "status", agent: "research", message: `Reading "${t}"` });
    const p = await readWikipedia(t).catch(() => null);
    if (p) {
      pages.push(p);
      emit({ type: "source", source: p.source });
    }
  }
  if (!pages.length) throw new Error(`Couldn't find anything about "${topic}". Try a more specific concept.`);

  const main = pages[0];
  const rel = (s: string) => {
    const words = `${topic} ${company}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    return words.reduce((n, w) => n + (s.toLowerCase().includes(w) ? 1 : 0), 0);
  };
  const mainSents = sentences(main.text);
  const extra = pages.slice(1).flatMap((p) => sentences(p.text).filter((s) => rel(s) > 0).slice(0, 4));
  const facts = [...mainSents.slice(0, 8), ...extra].slice(0, 12);

  emit({ type: "notes", facts, via: "wikipedia" });
  return {
    topic: main.title,
    company,
    summary: mainSents.slice(0, 3).join(" "),
    facts,
    sources: pages.map((p) => p.source),
    via: "wikipedia",
  };
}
