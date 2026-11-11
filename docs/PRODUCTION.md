# EduTok: path to production

Internal doc. Last updated 2026-11-11.

**Goal:** real users sign in with Google, watch clips, like/save/follow/comment, and make AI clips. Their data lives on our servers, not in their browser.

**Today:** the app runs locally. Guest login works, the agents run offline (Wikipedia + templates), engagement lives in `localStorage`, and AI clips are JSON files in `data/generated/`. None of that survives a real deployment.

Items are ordered by dependency. **P0** = must have before any outside user. **P1** = before a public launch. **P2** = after launch.

---

## 1. Google sign-in (P0)

Code is ready in `lib/auth.ts`; it turns on when the env vars exist.

- [ ] Google Cloud Console: create a project, configure the OAuth consent screen (app name, logo, support email, privacy policy + terms URLs), scopes `openid email profile` only.
- [ ] Create an OAuth client (Web). Redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://<prod-domain>/api/auth/callback/google`
- [ ] Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`) in the host's env.
- [ ] Submit the consent screen for verification. Until verified, only listed test users (max 100) can sign in.
- [ ] **Remove or gate the guest provider in production.** It's a `CredentialsProvider` that accepts any name and invents a random ID, so anyone can create unlimited accounts and burn AI credits. Options: drop it when `NODE_ENV=production`, or keep it read-only (watch, no generate/ask/comment).
- [ ] Store users in the database (see §2) via the NextAuth Prisma/Drizzle adapter, or upsert in the `jwt` callback. Today `session.user.id` is only the JWT `sub`, never persisted.

## 2. Database (P0)

Nothing user-owned is persisted server-side today.

| Data | Today | Production |
|---|---|---|
| Users | JWT only | `users` table (Google id, name, email, avatar, created_at) |
| Seed clips | `content/seed.ts` | Keep in code, or seed into `clips` |
| AI clips | `data/generated/*.json` (`lib/clip-store.ts`) | `clips` table (scenes as JSONB), with `creator_id` |
| Likes, saves, follows | `localStorage` key `edutok:v1` (`lib/user-state.tsx`) | `likes`, `saves`, `follows` tables |
| Comments + tutor replies | `localStorage` | `comments` table (`clip_id`, `user_id`, `parent_id`, `is_ai`) |
| Watch history | `localStorage` | `views` table (`user_id`, `clip_id`, `watched_ms`, `completed`). This is the ML training signal. |
| Like/comment counts | Fake numbers from a hash (`baseCounts` in `lib/format.ts`) | Real counts from the tables (cached counter columns) |

- [ ] Pick Postgres (Neon, Supabase or Vercel Postgres) + an ORM (Drizzle or Prisma) with migrations.
- [ ] Rewrite `lib/clip-store.ts` against the DB. **The file store will break on Vercel**: the filesystem is read-only and per-instance.
- [ ] Add API routes for like/save/follow/comment/view, with session checks. Swap `UserStateProvider` to call them (optimistic UI, keep `localStorage` only for muted/captions prefs).
- [ ] One-time import: on first Google login, upload the user's existing `localStorage` state so early testers don't lose likes.
- [ ] Fix "Made with AI" on the profile to show only the user's own clips (needs `creator_id`).
- [ ] Indexes on `(user_id, clip_id)` and `clips(created_at)`. Backups enabled.

## 3. Claude agents (P0)

The Claude code paths (`lib/agents/*`) are type-checked but **have never run against the real API**. The machine had no key.

- [ ] Add `ANTHROPIC_API_KEY` and run `npm run agent -- "Consistent hashing" "Amazon DynamoDB" 2`. Fix whatever breaks in research (web search/fetch loop), writer (structured output) and guide (streamed tool call).
- [ ] Compare Claude clips against the hand-written seed clips. Tune prompts until they're comparable.
- [ ] Decide whether the Wikipedia/template offline path stays in production. Recommendation: keep it only as a fallback when the API is down, and label those clips.
- [ ] Log token usage per request (model, input/output tokens, user id) to the DB so cost is visible per user.
- [ ] Workspace spend limit set in the Anthropic console.

## 4. Abuse, limits and security (P0)

- [ ] **`/api/chat` and `/api/ask` have no auth check.** Anyone on the internet can call them and spend our API credits. Require a session (like `/api/generate` does).
- [ ] Per-user rate limits (e.g. Upstash Redis): something like 5 generations/day, 50 tutor questions/day, 100 chat turns/day. Return a friendly 429.
- [ ] Global daily budget kill-switch for generation.
- [ ] Input validation: cap concept/company length (generate route currently only checks non-empty), cap `count`.
- [ ] Moderation: generated clips and user comments are shown to other users. At minimum, a review/flag step for AI clips before they enter other people's feeds, a report button, and an admin way to hide a clip or comment.
- [ ] Security headers (CSP, frame-ancestors), HTTPS only, secure cookies (NextAuth does this when `NEXTAUTH_URL` is https).
- [ ] Never commit `.env*` (already gitignored). Keep secrets only in the host's env store.

## 5. Generation as a background job (P1)

`/api/generate` streams for up to 300 s (`maxDuration = 300`). That needs a paid Vercel plan, and a dropped connection loses the job.

- [ ] Move generation to a queue (Inngest, Trigger.dev, or a DB `jobs` table + worker). The route enqueues and returns a job id.
- [ ] Studio polls or subscribes to job progress; jobs survive page reloads.
- [ ] Notify the user when clips are ready (in-app badge, later push).
- [ ] Deduplicate: if a clip for the same concept+company exists, offer it instead of regenerating (two identical "How Amazon DynamoDB uses Consistent hashing" clips exist today).

## 6. Deployment (P0)

- [ ] Host: Vercel (simplest for Next.js 14) with Postgres alongside. Set env vars per environment (preview vs production use different OAuth clients and DBs).
- [ ] Domain + DNS; update `NEXTAUTH_URL` and the Google redirect URI.
- [ ] CI on GitHub: `npm run lint`, `tsc --noEmit`, `next build` on every PR. Note: Actions workflow files need a token with `workflow` scope to push.
- [ ] Preview deployments per branch.

## 7. Observability (P1)

- [ ] Error tracking (Sentry) for client and server.
- [ ] Structured logs for agent runs: duration, tool calls, failures, tokens.
- [ ] Product analytics: sign-ups, daily active users, clips watched per session, completion rate, generations per user.
- [ ] Uptime check on `/` and `/api/auth/session`.

## 8. Legal and content (P0 for Google verification, P1 otherwise)

- [ ] Privacy policy and terms pages (Google's consent screen requires the URLs).
- [ ] Account deletion: a button that deletes the user and their likes/comments/clips.
- [ ] Attribution: offline clips quote Wikipedia (CC BY-SA). Keep source links visible on every clip (they are today, in the info overlay).
- [ ] AI-generated clips are already badged "AI STUDIO". Add a note that AI content can contain mistakes.
- [ ] Branding: name, logo and colors are EduTok's own. Keep it that way; don't use TikTok's name or assets in marketing.

## 9. Product polish before launch (P1)

- [ ] Real counts everywhere (see §2); hide counts under a threshold instead of showing fake numbers.
- [ ] A ranking that isn't hand-picked: start with recency + completion rate + category affinity from `views` (simple SQL), before any ML.
- [ ] Better offline clip quality, or drop offline clips from shared feeds.
- [ ] Onboarding: pick 3 interests after first login to seed For You.
- [ ] Empty/error states for every API failure (rate limited, generation failed, offline).
- [ ] Accessibility pass: focus order, aria labels on the rail, reduced-motion support for animations.
- [ ] Lighthouse/perf pass on mobile (bundle size, font loading).
- [ ] PWA manifest so people can "Add to Home Screen" on phones.

## 10. Later (P2)

- Data + ML pipeline: event stream from `views`, training a recommender, quality scoring for AI clips (as planned).
- Real video export (render scenes to MP4) for sharing outside the app.
- Creator profiles: users publish their AI clips to their own channel.
- Push notifications, streaks, quizzes after clips.

---

## Suggested order

1. API key + fix the Claude agents (§3), lock down `/api/chat` and `/api/ask` (§4).
2. Postgres + schema + move clip store and engagement off disk/`localStorage` (§2).
3. Google OAuth for real, guest login off in production (§1).
4. Rate limits, budget cap, moderation basics (§4).
5. Deploy to Vercel with a domain, privacy policy, terms (§6, §8).
6. Background jobs, observability, polish (§5, §7, §9). Then invite users.
