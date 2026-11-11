// CLI for the agent pipeline: npm run agent -- "Consistent hashing" "Amazon DynamoDB" 2
import { generateClips } from "../lib/agents/pipeline";

const [concept, company = "", count = "1"] = process.argv.slice(2);
if (!concept) {
  console.error('usage: npm run agent -- "<concept>" "[company]" [count]');
  process.exit(1);
}

generateClips({ concept, company, count: Number(count) }, (e) => {
  if (e.type === "status") console.log(`[${e.agent}] ${e.message}`);
  else if (e.type === "source") console.log(`  source: ${e.source.title} <${e.source.url}>`);
  else if (e.type === "notes") console.log(`  notes via ${e.via}: ${e.facts.length} facts`);
  else if (e.type === "clip") console.log(`  clip: ${e.clip.id} · "${e.clip.title}" (${e.clip.scenes.length} scenes)`);
  else if (e.type === "done") console.log(`done: ${e.clipIds.join(", ")}`);
}).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
