import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { existsSync } from "fs";
import { homedir } from "os";
import path from "path";

export const MODEL = "claude-opus-5-5";
// Refusal fallbacks: if a request is declined by a safety classifier, the API re-runs it on a
// fallback model inside the same call. "default" lets the API pick the route by category.
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

// The SDK resolves credentials from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN or an `ant auth login`
// profile. We only check whether one is plausibly present to decide on the offline fallback.
export function claudeAvailable(): boolean {
  if (process.env.EDUTOK_OFFLINE === "1") return false;
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return true;
  return existsSync(path.join(homedir(), ".config", "anthropic"));
}

let client: Anthropic | null = null;
export function claude(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function isAuthError(e: unknown): boolean {
  return e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError;
}
