// Starter concepts the studio suggests. Each pairs a technical idea with a company that made it famous.
export interface Idea {
  concept: string;
  company: string;
  hook: string;
  tags: string[];
}

export const ideas: Idea[] = [
  { concept: "Consistent hashing", company: "Amazon DynamoDB", hook: "How to add servers without reshuffling every key", tags: ["database", "distributed", "scale", "cache"] },
  { concept: "Content delivery networks", company: "Akamai", hook: "Why videos load fast on the other side of the world", tags: ["network", "cdn", "web", "video"] },
  { concept: "Vector databases", company: "Pinecone", hook: "How AI apps search by meaning instead of keywords", tags: ["ai", "search", "database", "embeddings"] },
  { concept: "Retrieval-augmented generation", company: "Perplexity", hook: "How AI answers with sources instead of guessing", tags: ["ai", "llm", "search"] },
  { concept: "Mixture of experts", company: "Mistral AI", hook: "Big models that only use part of their brain per word", tags: ["ai", "llm", "efficiency"] },
  { concept: "Lithium-ion battery chemistry", company: "Tesla", hook: "What actually limits an EV's range", tags: ["hardware", "energy", "battery", "cars"] },
  { concept: "Extreme ultraviolet lithography", company: "ASML", hook: "The machine every advanced chip depends on", tags: ["hardware", "chips", "semiconductor"] },
  { concept: "WebAssembly", company: "Figma", hook: "How a design tool runs at native speed in a browser", tags: ["web", "performance", "product"] },
  { concept: "Event sourcing", company: "Monzo", hook: "Banking systems that never overwrite history", tags: ["fintech", "database", "architecture"] },
  { concept: "Payment rails and interchange", company: "Stripe", hook: "Where the 3% on every card payment goes", tags: ["fintech", "payments", "money"] },
  { concept: "Edge computing", company: "Vercel", hook: "Running your code a few miles from every user", tags: ["web", "cloud", "network"] },
  { concept: "Serverless functions", company: "AWS Lambda", hook: "Paying only for the milliseconds your code runs", tags: ["cloud", "infrastructure"] },
  { concept: "Kubernetes scheduling", company: "Google Borg", hook: "How Google packs millions of jobs onto machines", tags: ["infrastructure", "containers", "cloud"] },
  { concept: "End-to-end encryption", company: "Signal", hook: "Why even the company can't read your messages", tags: ["security", "crypto", "messaging"] },
  { concept: "Two-sided marketplace matching", company: "Airbnb", hook: "Ranking homes so both guests and hosts win", tags: ["product", "search", "ranking"] },
  { concept: "Recommendation systems", company: "YouTube", hook: "How a feed learns what you'll watch next", tags: ["ai", "ranking", "product", "feed"] },
  { concept: "A/B testing at scale", company: "Booking.com", hook: "Running thousands of experiments at once", tags: ["product", "data", "experiments"] },
  { concept: "Write-ahead logging", company: "PostgreSQL", hook: "How databases survive a power cut mid-write", tags: ["database", "reliability"] },
  { concept: "Rate limiting", company: "GitHub", hook: "Keeping an API alive when one client goes wild", tags: ["api", "infrastructure", "reliability"] },
  { concept: "Reusable rocket engines", company: "Rocket Lab", hook: "3D-printed engines and why they changed small launch", tags: ["space", "hardware", "rockets"] },
  { concept: "Lidar vs camera perception", company: "Waymo", hook: "How self-driving cars see the road", tags: ["ai", "cars", "hardware", "robotics"] },
  { concept: "CRISPR gene editing", company: "Intellia", hook: "Editing DNA like text in a document", tags: ["biotech", "science"] },
  { concept: "mRNA vaccines", company: "Moderna", hook: "Shipping instructions instead of the product", tags: ["biotech", "science", "health"] },
  { concept: "Proof of stake", company: "Ethereum", hook: "Securing a blockchain without mining", tags: ["crypto", "blockchain", "security"] },
];

export function matchIdeas(text: string, n = 3): Idea[] {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const scored = ideas.map((i) => {
    const hay = `${i.concept} ${i.company} ${i.hook} ${i.tags.join(" ")}`.toLowerCase();
    return { i, s: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
  });
  const hits = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.i);
  const rest = ideas.filter((i) => !hits.includes(i)).sort(() => Math.random() - 0.5);
  return [...hits, ...rest].slice(0, n);
}
