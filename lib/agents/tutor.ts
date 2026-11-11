import "server-only";
import type { Clip } from "@/lib/types";
import { claude, claudeAvailable, FALLBACK_BETA, MODEL } from "./claude";

// Answers learner questions in a clip's comment thread, grounded in the clip's script and sources.
export async function* askTutor(clip: Clip, question: string, history: { ai: boolean; text: string }[]): AsyncGenerator<string> {
  if (claudeAvailable()) {
    try {
      yield* askClaude(clip, question, history);
      return;
    } catch {
      /* offline fallback below */
    }
  }
  yield* askOffline(clip, question);
}

function script(clip: Clip) {
  return [
    `Title: ${clip.title}`,
    `Concept: ${clip.concept} (${clip.company})`,
    ...clip.scenes.map((s, i) => `Scene ${i + 1} — ${s.caption}: ${s.narration}`),
    `Sources: ${clip.sources.map((s) => `${s.title} <${s.url}>`).join("; ")}`,
  ].join("\n");
}

// The API needs user/assistant turns to alternate, starting with the user: merge runs of the same role.
function alternate(turns: { ai: boolean; text: string }[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const t of turns) {
    const role = t.ai ? "assistant" : "user";
    const prev = out[out.length - 1];
    if (prev?.role === role) prev.content += `\n\n${t.text}`;
    else out.push({ role, content: t.text });
  }
  while (out[0]?.role === "assistant") out.shift();
  return out;
}

async function* askClaude(clip: Clip, question: string, history: { ai: boolean; text: string }[]): AsyncGenerator<string> {
  const stream = claude().beta.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: `You are EduTok's tutor, replying in the comments of a short educational clip. Answer in 2-5 short sentences, plain text, friendly and precise. Ground answers in the clip script; you may add well-established background knowledge, but say so if you're unsure. If the question is off-topic, gently steer back.\n\nCLIP SCRIPT:\n${script(clip)}`,
    messages: alternate([...history.slice(-6), { ai: false, text: question }]),
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") yield "\n\nI can't help with that one, but ask me anything about how this works!";
}

async function* askOffline(clip: Clip, question: string): AsyncGenerator<string> {
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const best = [...clip.scenes]
    .map((s) => ({ s, n: words.reduce((n, w) => n + (`${s.caption} ${s.narration} ${JSON.stringify(s.visual)}`.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.n - a.n)[0];
  const answer =
    best && best.n > 0
      ? `Good question! The key part is "${best.s.caption}": ${best.s.narration}${best.s.visual.kind === "bullets" ? ` (${best.s.visual.items.join(" · ")})` : ""}`
      : `Here's the short version: ${clip.scenes[1]?.narration ?? clip.scenes[0].narration}`;
  const tail = clip.sources[0] ? ` For the full story, check ${clip.sources[0].title}.` : "";
  const text = `${answer}${tail}\n\n(Offline tutor. Add an ANTHROPIC_API_KEY for full answers.)`;
  for (const chunk of text.split(/(?<= )/)) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 15));
  }
}
