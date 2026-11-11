import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { matchIdeas } from "@/content/ideas";
import { claude, claudeAvailable, FALLBACK_BETA, MODEL } from "./claude";

// The studio chatbot: helps the learner choose a concept, then hands off to the clip pipeline.
export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface Suggestion {
  concept: string;
  company: string;
  hook: string;
}

export type ChatEvent = { type: "text"; text: string } | { type: "suggestions"; items: Suggestion[] } | { type: "done" };

const GUIDE_SYSTEM = `You are the EduTok Studio guide. EduTok is a short-form learning app that replaces doom-scrolling with 60-second clips about the engineering behind great startups and technological breakthroughs.

Your job: help the learner pick a specific concept to turn into clips.
- Keep replies short (2-4 sentences), warm and curious. No markdown headers.
- When the learner is vague ("AI", "rockets", "how apps scale"), offer concrete options.
- Always pair a concept with a real company or project that made it famous, e.g. "Consistent hashing at Amazon DynamoDB".
- Whenever you propose concepts, call suggest_concepts with 2-4 options so the app can show one-tap buttons. Mention them briefly in your text too.
- If the learner names a concept clearly, confirm it and call suggest_concepts with that concept first.`;

const SuggestSchema = z.object({
  concepts: z
    .array(z.object({ concept: z.string().min(1), company: z.string(), hook: z.string() }))
    .min(1)
    .max(4),
});

const suggestTool: Anthropic.Beta.BetaTool = {
  name: "suggest_concepts",
  description: "Show the learner one-tap options for concepts to turn into clips. Each option pairs a concept with the company or project that made it famous and a one-line hook.",
  strict: true,
  eager_input_streaming: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["concepts"],
    properties: {
      concepts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["concept", "company", "hook"],
          properties: {
            concept: { type: "string", description: "The technical concept, e.g. 'Consistent hashing'" },
            company: { type: "string", description: "Company or project that made it famous" },
            hook: { type: "string", description: "One-line curiosity hook, under 12 words" },
          },
        },
      },
    },
  },
};

export async function* chat(history: ChatTurn[]): AsyncGenerator<ChatEvent> {
  if (claudeAvailable()) {
    try {
      yield* chatWithClaude(history);
      return;
    } catch {
      /* fall through to offline guide */
    }
  }
  yield* chatOffline(history);
}

async function* chatWithClaude(history: ChatTurn[]): AsyncGenerator<ChatEvent> {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.text }));
  const stream = claude().beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: GUIDE_SYSTEM,
    tools: [suggestTool],
    messages,
  });

  let sentText = false;
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      sentText = true;
      yield { type: "text", text: event.delta.text };
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    if (!sentText) yield { type: "text", text: "Let's pick a different topic. What part of startup tech are you curious about?" };
  }
  for (const block of final.content) {
    if (block.type !== "tool_use" || block.name !== "suggest_concepts") continue;
    // Eager input streaming skips server-side validation, so validate before using.
    const parsed = SuggestSchema.safeParse(block.input);
    if (parsed.success) yield { type: "suggestions", items: parsed.data.concepts };
  }
  yield { type: "done" };
}

async function* chatOffline(history: ChatTurn[]): AsyncGenerator<ChatEvent> {
  const last = history.filter((t) => t.role === "user").at(-1)?.text ?? "";
  const picks = matchIdeas(last, 3);
  const reply =
    last.length < 3
      ? "What are you curious about? Pick one of these or tell me a topic, like AI, rockets, payments or how apps scale."
      : `Good pick. Here are concrete angles on that. Tap one and the research agents will dig in, or type any concept you like and press Make clips.`;
  for (const word of reply.split(/(?<= )/)) {
    yield { type: "text", text: word };
    await new Promise((r) => setTimeout(r, 18));
  }
  yield { type: "suggestions", items: picks.map(({ concept, company, hook }) => ({ concept, company, hook })) };
  yield { type: "done" };
}
