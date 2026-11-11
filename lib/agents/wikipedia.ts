import "server-only";
import type { Source } from "@/lib/types";

const API = "https://en.wikipedia.org/w/api.php";
const UA = "EduTok/0.1 (educational app)";

async function call(params: Record<string, string>) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  return res.json();
}

export async function searchWikipedia(query: string, limit = 3): Promise<string[]> {
  const data = await call({ action: "query", list: "search", srsearch: query, srlimit: String(limit) });
  return (data.query?.search ?? []).map((r: { title: string }) => r.title);
}

export async function readWikipedia(title: string): Promise<{ title: string; text: string; source: Source } | null> {
  const data = await call({
    action: "query",
    prop: "extracts|info",
    inprop: "url",
    explaintext: "1",
    exsectionformat: "plain",
    redirects: "1",
    titles: title,
  });
  const page = data.query?.pages?.[0];
  if (!page || page.missing || !page.extract) return null;
  return {
    title: page.title,
    text: String(page.extract).slice(0, 12000),
    source: { title: `Wikipedia: ${page.title}`, url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` },
  };
}

// Split prose into clean, self-contained sentences for the offline writer.
export function sentences(text: string): string[] {
  return text
    .replace(/\([^)]{0,80}\)/g, "") // drop short parentheticals (pronunciations, dates)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 260 && !/^(See also|References|External links)/.test(s));
}
