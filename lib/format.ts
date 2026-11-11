// Deterministic pseudo-random numbers from a string, so mock counts are stable between renders.
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

// Placeholder engagement until real analytics exist.
export function baseCounts(id: string) {
  const h = hash(id);
  return {
    likes: 1200 + (h % 240_000),
    comments: 40 + (h % 3100),
    saves: 300 + ((h >>> 3) % 42_000),
    shares: 90 + ((h >>> 5) % 18_000),
  };
}

// Reading pace for narration, used for scene timing when speech is off.
export function sceneMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(3500, Math.min(14000, (words / 2.6) * 1000 + 900));
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

// The UI is monochrome: every clip renders with a white accent regardless of its stored brand color.
// Clip.color is kept in the data model so a themed mode can come back later.
export function usableAccent(hex?: string): string {
  void hex;
  return "#ffffff";
}
