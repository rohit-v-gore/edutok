import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Clip } from "./types";
import { seedClips } from "@/content/seed";

// Until the real database lands, AI-generated clips are persisted as JSON files on disk.
const DIR = path.join(process.cwd(), "data", "generated");

async function readGenerated(): Promise<Clip[]> {
  try {
    const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".json"));
    const clips = await Promise.all(
      files.map(async (f) => JSON.parse(await fs.readFile(path.join(DIR, f), "utf8")) as Clip),
    );
    return clips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function allClips(): Promise<Clip[]> {
  return [...(await readGenerated()), ...seedClips];
}

export async function getClip(id: string): Promise<Clip | undefined> {
  return (await allClips()).find((c) => c.id === id);
}

export async function saveClip(clip: Clip): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${clip.id}.json`), JSON.stringify(clip, null, 2));
}
