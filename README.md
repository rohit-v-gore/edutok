# EduTok

A short-form, swipeable learning feed. Instead of random videos, every clip is a 45–75 second explainer on the engineering behind great startups and technological breakthroughs, like Stripe's idempotency keys, Discord's message storage or SpaceX's booster landings. An **AI Studio** chatbot lets you pick any concept. Research agents then read the web and script new clips straight into your feed.

The goal: a feed people can open instead of a social app that doesn't teach them anything.

## Features
- **Vertical snap feed** (For You / Following): tap to pause, double-tap to like, keyboard ↑/↓, a segmented scrubber, loop playback, and a mobile layout with a bottom nav and top tabs.
- **Clips without video files.** Each clip is a set of animated scenes (titles, bullet builds, process flows, stats, comparisons, code, grids) with optional voice narration (Web Speech API) and karaoke-style captions.
- **Action rail.** Follow, like, comment, save and share (copy link, X, LinkedIn, WhatsApp, email, native share, or download study notes as Markdown).
- **Comments double as Q&A.** Toggle *Ask AI* and the tutor answers questions about that clip, grounded in its script.
- **AI Studio.** A chat guide suggests concrete concept + company pairings. *Make clips* runs the agent pipeline with live progress:
  1. **Research agent:** Claude with server-side web search and web fetch, preferring engineering blogs and papers. It returns a summary, facts and sources.
  2. **Script writer:** Claude with structured outputs turns the notes into 5-scene clips.
  3. **Publisher:** saves the clips and boosts them in your For You feed.
- **Explore** (search, categories, channels, trending companies), **channel pages**, and a **profile** with Liked, Saved, Made with AI and Watched tabs plus learning stats.
- **Google sign-in** via NextAuth, plus a guest login so it works before OAuth is configured.
- 22 hand-written launch clips, each citing its primary sources.

## Run it
```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
```

### Google sign-in
1. Google Cloud Console → APIs & Services → Credentials → *Create OAuth client ID* (Web application).
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and a `NEXTAUTH_SECRET` (`openssl rand -base64 32`) in `.env.local`.

### AI agents
Set `ANTHROPIC_API_KEY` in `.env.local` to enable the Claude agents (model `claude-opus-5-5`, with server-side refusal fallbacks enabled). Without a key, everything still works in **offline mode**:
- Research uses the Wikipedia API. Sentences are quoted with attribution; Wikipedia text is CC BY-SA.
- A template writer scripts the clip.
- The chat guide and tutor use simple keyword matching.

Generate clips from the terminal:
```bash
npm run agent -- "Consistent hashing" "Amazon DynamoDB" 2
```

## Project layout
| Path | What |
|---|---|
| `app/` | Next.js App Router pages (feed, explore, studio, profile, channel, clip, login) and API routes |
| `components/player/` | Scene player: timing, narration, captions, visuals, action rail |
| `components/feed/` | Snap feed, comments/Q&A sheet, share sheet |
| `components/studio/` | AI Studio chat + agent progress UI |
| `lib/agents/` | `research.ts`, `writer.ts`, `guide.ts`, `tutor.ts`, `pipeline.ts` |
| `content/` | Launch clips, channels, starter concept ideas |
| `lib/user-state.tsx` | Likes, saves, follows, comments, watch history (localStorage for now) |
| `data/generated/` | AI-made clips as JSON (stand-in for the database) |

## Roadmap
- Database for users, clips and engagement, replacing localStorage and JSON files
- Data collection + ML pipelines: a real recommender, and quality scoring of generated clips
- Rendered video/audio export, creator uploads, moderation and fact-check review for AI clips
