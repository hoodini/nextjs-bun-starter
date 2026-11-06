# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RunCoach + CalTrack + Portfolio** - A multi-app platform featuring an AI Running Coach with Strava integration, a calorie tracking dashboard (CalTrack), a professional CV/portfolio, and a blog with TTS. Built with Next.js 16, React 19, Bun, TypeScript, and Supabase.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, NextAuth.js, Supabase (PostgreSQL + RLS), OpenRouter (Claude/Grok/GPT-4o), Strava API, Vercel Cron, Bun runtime

**Repository:** https://github.com/iAMido/running-coach
**Deployed:** Vercel (auto-deploy from `master`)

## Development Commands

```bash
bun run dev      # Start dev server with Turbopack
bun run build    # Production build - MUST pass before every commit
bun run start    # Start production server
bun run lint     # Run ESLint
```

```bash
bun install              # Install dependencies
bun add <package>        # Add dependency
bunx shadcn@latest add <component>  # Add shadcn/ui component
```

## Architecture

### App Router Structure
- **Server Components by default** unless marked `'use client'`
- **API Routes** use `export const runtime = 'nodejs'` for external API calls
- **Vercel Cron** for scheduled Strava sync
- **One Supabase project, two schemas** (post-consolidation, May 2026): the CalTrack project (`tlnqkxwlrewbtufnqiwi`) hosts both apps. CalTrack's tables live in the `public` schema; RunCoach's tables live in the `runcoach` schema. The two `lib/db/supabase*` clients are configured with different `db.schema` settings to route queries to the right place. The old RunCoach project (`ucjsnpnlxklaadqolpkx`) was deleted on 2026-10-04 — every app, env var and MCP call must use `tlnqkxwlrewbtufnqiwi`.

### Directory Structure
```
app/
├── page.tsx                          # CV homepage (client component, anchor nav)
├── layout.tsx                        # Root layout with providers
├── providers.tsx                     # ThemeProvider + SessionProvider
├── globals.css                       # Tailwind + RunCoach design system
├── api/
│   ├── auth/[...nextauth]/route.ts   # NextAuth (Google OAuth)
│   ├── coach/
│   │   ├── chat/ask/route.ts         # Ask Coach (Claude via OpenRouter)
│   │   ├── chat/grocky/route.ts      # Grocky Balboa (Grok second opinion)
│   │   ├── feedback/route.ts         # Run feedback CRUD (links to run_id)
│   │   ├── plans/route.ts            # Training plans CRUD
│   │   ├── plans/build/route.ts      # Staged plan builder (what the UI uses) — one stage per POST
│   │   ├── plans/generate/route.ts   # Single-call plan generation (legacy, still callable)
│   │   ├── plans/adjust/route.ts     # AI plan adjustment
│   │   ├── profile/route.ts          # Athlete profile
│   │   ├── reports/route.ts          # Coach reports list/detail
│   │   ├── review/route.ts           # Weekly review data
│   │   ├── review/analyze/route.ts   # AI weekly analysis (saves to coach_reports)
│   │   ├── runs/route.ts             # Runs data with pagination
│   │   ├── stats/route.ts            # Dashboard statistics
│   │   ├── strength/route.ts         # Strength training
│   │   └── upload/route.ts           # GPX/FIT file upload
│   ├── strava/
│   │   ├── auth/route.ts             # Strava OAuth initiation
│   │   ├── callback/route.ts         # Strava OAuth callback
│   │   ├── disconnect/route.ts       # Disconnect Strava
│   │   └── sync/route.ts             # Manual Strava sync (with laps)
│   ├── cron/
│   │   └── strava-sync/route.ts      # Automated sync (Vercel Cron, CRON_SECRET)
│   ├── caltrack/                     # CalTrack endpoints (separate Supabase)
│   │   ├── overview/route.ts         # Daily summary, weight chart
│   │   ├── meals/route.ts            # Meals list
│   │   ├── meals/add/route.ts        # Add meal
│   │   ├── meals/edit/route.ts       # Edit meal
│   │   ├── meals/delete/route.ts     # Delete meal
│   │   ├── analyze/route.ts          # AI food analysis (Hebrew support)
│   │   ├── weight/route.ts           # Weight logs
│   │   ├── foods/route.ts            # Food database
│   │   ├── foods/search/route.ts     # Food search
│   │   ├── water/route.ts            # Water tracking
│   │   ├── templates/route.ts        # Meal templates
│   │   └── coach-reports/route.ts    # CalTrack coach reports
│   └── admin/
│       └── regenerate-embeddings/route.ts  # RAG embedding regeneration
├── coach/                            # AI Running Coach (protected)
│   ├── layout.tsx                    # Protected layout with sidebar
│   ├── page.tsx                      # Dashboard (stats, recent runs, chart)
│   ├── log/page.tsx                  # Log runs + post-run feedback
│   ├── review/page.tsx              # Weekly review with AI analysis
│   ├── plan/page.tsx                 # Training plan generation
│   ├── ask/page.tsx                  # Ask Coach (Claude chat)
│   ├── grocky/page.tsx              # Grocky Balboa (Grok second opinion)
│   ├── reports/page.tsx             # Coach reports history (list + detail)
│   ├── strava/page.tsx              # Strava connection management
│   ├── strava/callback/page.tsx     # Strava OAuth callback
│   └── settings/page.tsx            # User settings
├── caltrack/                         # CalTrack calorie tracking
│   ├── layout.tsx                    # CalTrack layout with sidebar
│   ├── page.tsx                      # Overview (daily calories, macros, weight)
│   ├── meals/page.tsx               # Meals with add/edit/delete + AI analysis
│   ├── weight/page.tsx              # Weight log
│   ├── foods/page.tsx               # Food database browser
│   └── coach/page.tsx               # CalTrack coach reports
├── blog/
│   ├── page.tsx                      # Blog listing
│   └── [slug]/page.tsx              # Article (SSG with generateStaticParams)
└── profile/page.tsx                  # Protected user profile

components/
├── coach/sidebar.tsx                 # Coach sidebar navigation
├── cv/                               # CV components (anchor nav, hero, etc.)
├── blog/article-content.tsx          # Article with TTS player
├── layout/                           # Navbar, footer
└── ui/                               # shadcn/ui components

lib/
├── ai/
│   ├── openrouter.ts                 # OpenRouter API client (multi-model)
│   ├── coach-prompts.ts              # Claude coach system prompts
│   └── grocky-prompts.ts            # Grok system prompts
├── auth/
│   └── get-user.ts                   # getAuthenticatedUser() helper
├── db/
│   ├── supabase.ts                   # RunCoach Supabase client (service role)
│   ├── supabase-caltrack.ts          # CalTrack Supabase client (separate project)
│   ├── types.ts                      # RunCoach TypeScript types
│   ├── caltrack-types.ts             # CalTrack types
│   ├── runs.ts                       # Runs CRUD
│   ├── plans.ts                      # Training plans CRUD
│   ├── profile.ts                    # Athlete profile CRUD
│   ├── feedback.ts                   # Run feedback & weekly summaries
│   ├── books.ts                      # RAG book embeddings
│   ├── coach-workouts.ts             # Coach workout patterns
│   └── strength.ts                   # Strength training data
├── rag/                              # 3-layer RAG system
│   ├── book-retriever.ts             # Book methodology retrieval (merges user_resources too)
│   ├── coach-retriever.ts            # Coach patterns retrieval
│   ├── context-builder.ts            # Combines all RAG layers
│   ├── embeddings.ts                 # OpenAI embeddings generation
│   ├── chunker.ts                    # Paragraph-aware chunker for ingestion
│   ├── user-formatter.ts            # User data formatting for context
│   ├── user-resource-retriever.ts   # Per-user uploaded material retrieval
│   └── types.ts                      # RAG type definitions
├── supervisor/                       # Pre/post-flight gate around every AI call
│   ├── preflight.ts                  # Deterministic coverage rules
│   ├── critic.ts                     # Haiku response audit
│   ├── telemetry.ts                  # logCoachCall → coach_calls
│   ├── types.ts                      # Supervisor types
│   └── index.ts                      # Barrel export
├── validation/
│   └── schemas.ts                    # Zod validation schemas (feedback, etc.)
├── utils/
│   ├── pace.ts                       # Pace formatting/conversion
│   ├── run-classifier.ts            # Run type classification — honors athlete_profile zones, emits 'Intervals'
│   ├── zones.ts                     # HR zone helpers: parseZonesFromProfile, computeZonePercentsFromStream
│   ├── trimp.ts                      # Training load (TRIMP) calculation
│   ├── week-calculator.ts           # Week boundary calculations
│   └── oauth-state.ts              # Strava OAuth state management
├── hooks/
│   └── use-pwa.ts                    # PWA installation hook
├── cv-data.ts                        # CV content (single source of truth)
├── blog.ts                           # Blog data layer
└── utils.ts                          # cn() utility
```

### Supabase Tables (RunCoach project)
All tables have RLS enabled with policies for authenticated users.

| Table | Purpose |
|-------|---------|
| `runs` | Run data (from Strava sync or manual upload) |
| `laps` | Per-lap data for each run (HR, pace, distance) |
| `run_feedback` | Post-run feedback (rating, effort, notes) with `run_id` FK |
| `training_plans` | AI-generated training plans |
| `athlete_profile` | User settings (age, max HR, goals, etc.) |
| `weekly_summaries` | Weekly wellness check-in (sleep, stress, feeling). An earlier version of this table called it `weekly_feedback`; no such table exists — same error class as the `book_embeddings` entry above. |
| `coach_reports` | Saved AI coach analyses (weekly reviews) |
| `strava_tokens` | Strava OAuth tokens per user |
| `coaching_books` / `book_instructions` | RAG: running book methodology chunks. 10 entries as of 2026-09-26: the original 7 road/track books, plus *Training for the Uphill Athlete* (267 chunks — the first mountain source), *Advanced Marathoning* (235), and a synthetic "Expert Plan Library" book (2 chunks per exemplar plan). An earlier version of this table called these `book_embeddings`; no such table exists. |
| `plan_exemplars` | 10 distilled expert plans (Carmel-Kinneret 33K/55K, Norwegian ×3, HM PB, comeback, 2 strength blocks, 70.3). Selected deterministically per request and shown to plan generation as references. See "Expert plan exemplars" below. |
| `coach_workouts` | RAG: coach workout pattern embeddings |
| `coach_phases` | RAG: synthesized phase wisdom (Base / Specific) |
| `user_resources` / `user_resource_chunks` | RAG: athlete-uploaded coach material (per user, pgvector) |
| `coach_calls` | Supervisor: one row per AI request (tokens, latency, warnings) |
| `coach_response_audits` | Supervisor: Haiku critic scores per response |
| `coach_chat_sessions` / `coach_chat_messages` | Persisted chat history (Ask Coach) |
| `strength_exercises` | Strength training exercises |

### Key Patterns

**Staged plan builder (`lib/coach/plan-builder/`, 2026-09-27) — how plans are built now.** The plan page no longer calls `plans/generate/stream`; it drives `POST /api/coach/plans/build` one stage at a time, and every stage's output lives in `runcoach.plan_builds`:

| stage | what | how |
|---|---|---|
| `created` → prepare | athlete brief (last-4-complete-weeks km/vert, longest run, chosen vs actual run days), race brief (gradient, weeks to race, duration mismatch), research **one book search per need** (periodization, strength, climbing, descent, long run, taper, injury) | code + retrieval, ~12 s |
| `prepared` → outline | phases, **every week's targets**, day roles, strength sessions *by name only*, decisions, rationale | `MODEL_FOR.plan_outline` (Opus 5.5) |
| `outlined` → write | ≤4-week chunks never crossing a phase, all in parallel, plus a strength writer for the exercises | `plan_writer` (Opus 4.7), ~60 s |
| `written` → check | `checkPlan` (pure, `checks.ts`); errors are handed back to the chunk's writer verbatim, ≤2 repair rounds | code |
| `checked` → review | `checkCoherence` (phase joins, recovery alignment, peak vs outline) + head-coach review of the whole plan; must-fix → `coherence_fix` rewrites only those weeks; **≤2 rounds** | `plan_review` (Opus 5.5), ~100 s |
| `reviewed` → save | the ONLY stage that touches `training_plans`; saves `plan_json.build_report` (rendered as "How this plan was built") | code |

- **One stage per request is load-bearing.** Opus 5.5's thinking cannot be disabled or bounded (see Models); the first outline took 285 s of a 300 s limit before strength exercises were split out and prose capped. Stages are claimed (`running_until`) so a resumed page and an in-flight request never pay for the same call twice; the page resumes an unfinished build on load (`GET /api/coach/plans/build`).
- **Arithmetic is checked in code, judgement by the reviewer.** The first review caught treadmill sessions labelled at a third of what they climb ("30 min at 10-12%" as +18 m), silently breaking every weekly climbing cap; that became the `incline_vert_math` rule (`inclineVertFromDescription`, grade × speed × time with the treadmill table's default speeds). When the reviewer keeps finding the same measurable thing, turn it into a rule.
- **Zone label vs bpm is an error, not a note** (>5 bpm outside the label). The single-call generator wrote 23 of them in one 12-week plan ("Z1-Z2 (130-150)" — 150 is Z3), and `zone-discipline.ts` would then score correctly-run sessions as too hard.
- **Scoring:** `scripts/score-plan.ts --file <plan.json> [--warnings]` runs the same rules over any plan; `scripts/verify-plan-builder.ts` runs a full build in dry-run (`plan_builds.dry_run`, save refuses). Baseline on the same 12-week trail request: single-call 23 errors; staged build 0 (both staged runs) after its own repairs.
- The reviewer only sees `renderPlanCompact` — a field missing from that rendering reads to it as missing from the plan (it reported absent indoor alternatives that were all present). Render what you want reviewed.
- **Week 1 is never a finished week.** `start_date` was "today", and week 1 is the Sunday-Saturday week containing it — a plan built on a Saturday opened with a week already over (the reviewer spotted 27.9 km already logged against week 1's 27 km). `planStartSunday` (`plan-builder/dates.ts`): built Sun-Tue → this Sunday, Wed-Sat → next Sunday; prompts state week 1's dates, and an under-way week 1 says what is already done. The legacy routes use the same rule.
- Measured (2026-09-27, 12-week trail request): prepare 14 s, outline 122 s (was 285 s before strength exercises moved to their own writer and prose was capped), writers 47 s, checks+repairs 69 s, each review round 80-105 s, each fix round 80-110 s; total ~10.5 min over 9 requests. The second review round also caught a bug in the incline parser itself (it split "30 min at 11%, 3.5 km/h" at the comma and lost the speed) and refused the wrong relabel.
- **Cost is measured, not estimated** (`usage: { include: true }` → `timings[stage].cost/prompt/cached`, printed by `verify-plan-builder.ts`). ~$6/plan → **~$3.00** (2026-09-27) with quality unchanged (0 errors, 0 warnings; same must-fix count from the reviewer): (1) writers get the athlete + previous-coach layers but NOT the general book layer — that was 87% of the context and already shaped the outline; targeted research still reaches them (`athleteAndCoachLayers`); (2) writer prompts split into a byte-stable `shared` part sent as the cached prefix, so repair/fix calls read ~90% from cache; (3) a 1-token `primeWriterCache` call before the parallel first drafts (they start together and could not share a cache: $1.05 → $0.71); (4) repairs rewrite only the broken weeks (`narrowChunks`), not their whole chunk. Nothing chunk-specific may enter `shared`, or caching silently stops.
- **Strength: keep hard days hard (athlete's decision, 2026-09-27).** Loaded strength goes straight after the quality session on the same day — never the day before a quality session, the long run, or on the long-run day. The reference plans do place it the day before quality (Carmel-Kinneret 25/54), but the head coach's review objected in all three staged test builds and the fix loop kept moving it; the athlete chose the reviewer. Enforced in `PLAN_STRENGTH_RULES`, the writer rules, the plan-adjust rules and `checkPlan` (`strength_placement` error).
- **Seasons are staged too (`kind='season'`, `plan-builder/season.ts`, 2026-09-27).** The Season panel posts `{ kind: 'season', ...macroPlanGenerationSchema }` to the same `plans/build` route. Stages: prepare (the block builder's `prepare`, unchanged — measured brief, race brief, per-need book research; the old route never searched the books) → head-coach design (Opus 5.5, `buildMacroPlanPrompt` + briefs + research + a `decisions` array) → `checkSeason` (`season-checks.ts`: covers the horizon, ends on race week with a taper when the race is inside it, phase 1 starts from measured km AND climbing, no phase-to-phase leaps, peak climbing reaches the race's own gain, measurable exit criteria, no absolute decoupling bands, explicit poles decision above 40 m/km) with up to 2 redesigns → head-coach review, ≤2 fix rounds → `saveMacroPlan` + `macro_plans.build_report`. No phase writers: a season IS an outline. Issue/violation numbers are PHASE numbers for a season.
- Measured on the same 40-week request: staged season 6 min, **$1.15**; single-call $0.16. Both score 0 on the season rules — at season level the rules alone do not separate them; the review does. Reviewed identically, the single-call season had 3 must-fix problems (climbing started +52% above his measured 198 m/week; prescribed 55-65 m/km trail long runs no terrain he can reach delivers — Sorek is 47 m/km; descent had no numbers until phase 3, then 800+ m in one run). The staged season's reviews caught the same classes (plus decoupling exits on hiked sessions, which cannot compute; altitude; three consecutive climbing days) and fixed them before saving. The +52% start became a rule (`START_VERT` tightened).
- Legacy `/api/coach/macro-plan` POST still works but the UI no longer calls it; its GET still serves the active season.

**Season → phases → plans (athlete's design, 2026-09-27).** The season head coach writes a **brief per phase** (`MacroPhase.goal / why_this_length / must_haves / avoid / watch_for / handoff / kpis`). Each phase is then built as **ONE training plan by the block builder, when the phase is due** — never all at once, because a September plan for March is fiction. Phase 1 is built straight after the season.
- **KPIs are typed** (`PhaseKpi`: metric ∈ weekly_km, weekly_vert_m, long_run_km, session_vert_m, adherence_pct, decoupling_pctile, form, ctl; target; comparator; consecutive_weeks) so the app evaluates them (`lib/coach/phase-kpis.ts`, pure). Complete weeks only; unmeasured is `null`, never a pass. `checkSeason` refuses a phase with <2 KPIs or a KPI its own ranges / session cap / length cannot reach — the reviewer found that trap in every season before it was a rule.
- **"Due" = the last 2 weeks of the phase, or every KPI met early** (`season-progress.ts` `recommend`): all met → build next; one KPI close (≤15%) or improving and readiness not REST → advance, carrying the gap into the next brief as a must-have; otherwise extend 2-3 weeks — unless that would push the season past race day (`raceSlackWeeks`), in which case advance with the gaps. The app only recommends; phases advance when the athlete builds the next one.
- **Progress is tracked, not assumed**: `macro_plans.start_date` + `phase_progress` (status, real start, extension weeks, plan ids), written by `recordPhaseBuilt` when a phase plan saves. `currentPhase` / `timelineOf` read actual dates first. The weekly proposal cron and the scorecard now use `currentPhase` — they used to assume 12-week blocks (`blockNumber`), which put block 2 in the wrong phase for any real season.
- `POST plans/build { kind: 'phase', macroPlanId, phaseNumber, extensionWeeks? }` composes the request from the season (race, length) and profile (days). `prepare` renders the brief as the builder's contract (`formatPhaseBrief`) with a MEASURED hand-over (the previous phase's KPIs as they ended; an extension targets its own lagging KPIs). `checkPlan` holds weeks inside the phase bands (`phase_range`).
- The weekly review and the Saturday proposal append `kpiBlockFor(userId)` — the phase KPI table — and are told to steer toward the lagging KPIs and name which KPI each change serves. `GET /api/coach/season/status` feeds the Season panel (KPI table, recommendation with Build / Extend / Advance buttons, phase dates and status chips).
- Legacy `plans/generate` (+`/stream`) routes still work and share the rule text (`PLAN_STRENGTH_RULES`, `PLAN_TARGET_HR_RULES`, `PLAN_DAY_ANCHOR_RULES` in `coach-prompts.ts`). The Saturday weekly-proposal cron is unaffected.

**Season tab, season intake, revisions (2026-11-06).** `/coach/plan` has three tabs: **Season** (the season at a glance, current phase + KPIs, phases, "What you told the coach", Adjust / Design new), **Current plan**, **New plan** (block form only). The season form takes the same intake as a block (target time, recent result, weekly km, focus, limitations, notes); `formatSeasonIntake` (`plan-builder/season-intake.ts`, pure) puts it in the head coach's and reviewer's prompts, it is saved to `macro_plans.intake`, and `phaseBuildRequest` passes target time / limitations / recent result / focus / notes into every phase plan. **Adjust** = a new staged season build with `adjustsSeasonId` + `changeRequest`; the route renders the ACTIVE season server-side (`describeSeasonForRevision`) — never client text. The revised season starts next Sunday with fresh phase progress; the athlete chooses whether phase 1 is rebuilt.

**Weekly proposals only surface for the active plan (2026-11-06).** `selectPendingProposal` (`lib/coach/proposal-select.ts`): a proposal is shown only if it is the NEWEST weekly result and its `plan_id` is the active plan. The cron used to write `status='pending'` with `plan_id = null` when no plan was active; those rows then sat on top of a plan built five weeks later. That case is now `status='no_plan'` (3 old rows relabelled).

**Expert plan exemplars (2026-09-26).** Ten full-plan JSON exports supplied by the athlete are distilled by `lib/coach/plan-exemplars.ts` (pure, tested) into phase shape, loading rhythm, weekly volume/climb, every *distinct* coaching note, a representative week per phase, and the strength programme — the raw exports are 140 KB–4 MB of mostly repeated serialisation. `scripts/load-plan-exemplars.ts --commit` writes `runcoach.plan_exemplars` and the "Expert Plan Library" RAG book. At generation, `exemplarsForRequest` (`lib/coach/plan-exemplars-db.ts`) picks **2 structure references + 1 strength reference** by `scoreExemplar`: terrain dominates distance (a 21K with 1,300 m gain selects Carmel 33K + 55K, not the half-marathon plan), strength blocks are never structure references, masters strength at age ≥40. Selection is deterministic on purpose — "which plan is shaped like this race" is about terrain and distance, not embedding similarity. The prompt says *learn the structure, do not copy sessions*, and days in references are relative. Wired into plan generate (both), and macro-plan.

The strength extractor handles four encodings in precedence order (`strength_exercises` > `canonical_steps` > `library_workout.steps` > notes). `library_workout` is a trap: in some exports it is the *library template* the session was cloned from, not what was prescribed.

**Strength is part of the plan, not a side panel.** `Workout.strength?: PlannedStrength` rides on the run day. The model defines sessions ONCE in a top-level `strength_sessions` library and references them by id; `expandStrengthRefs` (`lib/coach/plan-strength.ts`) deep-copies them into each day before saving (dangling refs dropped). Inline strength was 27% of output and caused truncation. Placement: never on the long-run day (all ten reference plans agree). The day before quality was allowed on the reference-plan evidence until 2026-09-27, when the athlete chose "keep hard days hard" — see the staged-builder notes. Never invent kilogram loads. The generic `<StrengthWorkout>` panel on `/coach/plan` only renders for plans with no embedded strength.

**⚠️ A failed plan generation must never be saved (fixed 2026-09-26).** Both generate routes used to save `{ raw_response }` as the ACTIVE plan after retiring the current one whenever JSON parsing failed — so a truncated response silently destroyed the working plan. `parsePlanOutput` (`lib/coach/plan-output.ts`) now returns `ok:false` for truncated / unparseable / incomplete (fewer weeks than requested) and callers write to the DB only on `ok`; the stream route emits `error` before any write. Output ceiling is `planOutputTokenBudget(weeks) = min(64k, 4k + 2k·weeks)` — the old fixed 16,000 cut a 12-week plan off at week 10. `callOpenRouter` now surfaces `finishReason` and `completionTokens`. Measured: a 12-week plan with strength = 14.5k tokens, ~147 s at ~99 tok/s. No `maxDuration` is set on the route; long plans are bounded by the platform function timeout.

**Book retrieval phase/workout filter includes untagged chunks** (`20260926_book_filter_include_untagged.sql`). `search_instructions_filtered` previously required an exact tag match, so compound phase names ("Support/Build", "Specific/Peak") returned **zero** book chunks and generation ran without methodology. Now NULL / `All` tags always pass and matching is `filter ILIKE '%' || tag || '%'`. `BOOK_MATCH_THRESHOLD = 0.45` was re-measured on the 1,954-chunk corpus and still holds (7.9% pass).

**Loader scripts must use the `runcoach` schema.** `load-book-pdf.ts`, `load-books.ts`, `load-norwegian-method-txt.ts`, `import-trainingpeaks.ts`, `load-book-pdf.cjs` all created clients without `db: { schema: 'runcoach' }` and had been broken since the May consolidation ("Could not find the table 'public.coaching_books'"). pdf-parse is v2: `new PDFParse({ data }).getText()`, not a function call.

**Authentication:** NextAuth.js with Google OAuth. API routes use `getAuthenticatedUser()` from `lib/auth/get-user.ts`.

**AI Integration:** OpenRouter, with every task's model named in `lib/ai/model-registry.ts` (`MODEL_FOR`). 3-layer RAG provides context: athlete data + coach patterns + book methodology.

**Provider fallback — NanoGPT (2026-09-27).** `callOpenRouter` / `streamOpenRouter` try OpenRouter first and retry the SAME request on NanoGPT (`https://nano-gpt.com/api/v1/chat/completions`, `NANOGPT_API_KEY`) only when OpenRouter itself fails: network error, 5xx, 429, 408, 402 (credits out) or 401/403 (key problem) — never on 400/404/422, which would fail there too (`shouldFallBack`). Streams fall back only before the first token. Measured before wiring: every `MODEL_FOR` model has the same id and the same price on NanoGPT, answers, streams, reasons (the `reasoning` body works unchanged; reasoning arrives in a separate field the stream reader ignores) and returns `usage.cost`, with the account on zero-data-retention routes only. One difference: Claude caching there needs `prompt_caching: { enabled: true }` (`requestBody`) — Opus 4.7 read 0 of 4,129 tokens from cache without it, 4,123 with it. Haiku 4.5 never caches below Anthropic's ~4k-token minimum on either provider. `OpenRouterResponse.provider` says who answered; the plan builder logs `model (nanogpt)` in coach_calls. NanoGPT account settings: request logging OFF, support access OFF, ZDR-only ON, a per-key USD/day cap.

**Models (reviewed and measured 2026-09-26):** plan generation / season plan / Saturday proposal → **Opus 4.7**; staged builder: outline + review → **Opus 5.5**, phase writers → **Opus 4.7**; weekly review → **Opus 5.5**; chat, chat plan edits, plan adjust → **Sonnet 5**; run note, critic, question classifier → **Haiku 4.5**; Grocky → **Grok 4.7** (effort `low`); CalTrack food analysis → GPT-4o-mini (untouched). `chat_quick` is not used by the chat — every chat answer goes to `chat_default`; `chat_quick` only writes the morning-after run note.

- **Reasoning models eat `max_tokens`.** Opus 5.5 and Grok 4.7 cannot have reasoning disabled ("Reasoning is mandatory"); Sonnet 5 reasons on its own when a prompt is hard (0 tokens on a one-liner, 2,048 on the weekly review). Unhandled, a 300-token Opus call ended `length` and the streamed version returned **nothing**. `tokenFields` in `lib/ai/openrouter.ts` (`REASONING_POLICY`) therefore adds thinking headroom ON TOP of `maxTokens` and excludes reasoning from the response, switches Sonnet 5's thinking OFF unless a task asks (`REASONING_FOR`), and steers Grok by `effort` because it ignores token budgets. Every `maxTokens` in the app means visible-answer length. Adding a new model: check whether it reasons before routing a task to it.
- **Opus 5.5 was rejected for plan generation.** It treats the thinking budget as a hint: given 1,024 it thought 14,241 tokens and was cut off at week 10 of 12 after 265 s (the truncation guard refused the save). The function limit is 300 s; Opus 4.7 writes the same 12-week plan complete in 149 s. Re-test with `scripts/verify-plan-generation.ts --model <id> [--reasoning N]` before changing it.
- **The weekly review was being truncated in production** at its old 2,000-token limit (Sonnet 4.6 stopped mid-sentence at exactly 2,000). Now `WEEKLY_REVIEW_MAX_TOKENS = 5000`. `scripts/verify-weekly-review.ts [--models a,b]` compares models on the same real prompt, read-only.
- **Free OpenRouter models were tested for the Haiku jobs and none is usable** (2026-09-26): rate limits (`free-models-per-min`) and provider errors on most, one restricted to "agentic harnesses", and Nemotron Ultra leaked its reasoning into the answer ("The user wants me to…") — which would have become the run note. Haiku classified 7/8, wrote 3/3 notes, 2/2 valid critic JSON. Free endpoints may also log prompts that contain health data. The Haiku jobs cost cents a month.

**RAG context budget:** `TOKEN_BUDGETS_PER_QUERY` in `lib/rag/types.ts` sets the per-query-type budget (chat 20k, daily 24k, weekly review 32k, plan generation 48k). `QUERY_WEIGHTS` splits each budget across the three layers. Raised from the original 8k flat budget once we noticed the coach layer was capped at ~800 tokens and surfacing only 5 of 69 historical workouts.

**Prompt caching:** `callOpenRouter({ cacheSystemPrompt: true })` rewrites the first system message as a structured content array with `cache_control: ephemeral` (Anthropic only). Enabled on chat, weekly review, and plan generation. Multi-turn chat and retries hit the cache within 5 min.

**User context formatter (`lib/rag/user-formatter.ts`):**
- Joins `run_feedback` to each run by `run_id` (falls back to date) and shows rating / effort / feeling / comment / followed_plan inline. Previously fetched but never rendered.
- Serializes the current week's per-day planned workouts (type / distance / pace / HR / description) under "Active Training Plan".
- Calls `getRecentRunsWithLaps` to attach laps for quality workouts (Intervals, Tempo, Fartlek, Long Run, or any run with >15% Z4+ time).
- Uses `calculateCurrentWeek(plan.start_date, …)` rather than the stored `plan.current_week_num`, so the AI doesn't see a stale phase if the cron hasn't advanced.

**Weekly review prompt:** Renders a PLANNED vs ACTUAL block side-by-side and asks for per-rep interval commentary using the lap detail.

**Add a book A to Z (Coach Library, 2026-09-27).** Books are 6-11 MB and Vercel rejects request bodies over ~4.5 MB, so the browser PUTs the PDF straight to the private Storage bucket `coach-library` through a signed URL (`POST /api/coach/library/upload-url`; per-user folder `uploads/<sha256(userId)[:16]>/`), then `POST /api/coach/library/ingest` runs `lib/library/ingest.ts` one stage per request, resumable, claimed like the plan builder: extract text (lazy pdf-parse + CanvasFactory; <5k chars = scanned, refused) → Sonnet reads the opening + three body samples and returns title, author, year, description, methodology, level, tags, focus areas, phases, sample questions (`METADATA_PROMPT`, `parseBookMeta`) → duplicate check (`findDuplicateTitle`, BOTH directions, editions ignored — one-way matching let "Advanced Marathoning, Second Edition" load 272 duplicate sections) → `coaching_books` row + `buildChunks` (paragraphs kept until chunking; chapter = one line ≤80 chars) → embed into `book_instructions` in 100s under a 180 s budget → retrieval check on the sample questions → Storage files deleted. Any failure after the book row exists deletes the row and its sections. Uploads land in the SAME corpus as the loaded books (`raw_metadata.source = 'library_upload'`). The Library page lists every book (`GET /api/coach/library/books`, `book_section_counts()`). Measured: a 264-page, 5.9 MB book is searchable in ~36 s. `scripts/verify-library-ingest.ts --pdf <book>` runs the whole path, including the refusal of a duplicate, and deletes its test copy. **Replace + text files:** an upload can name an existing book under "Replaces" (`replace_book_id`); the old book is removed only after the new one is fully embedded and checked, and a snapshot of its row and sections is kept in `library_ingests.replaced`. `.txt` uploads skip PDF parsing — use them for article compilations and for scanned books (OCR first; a scanned PDF has no text layer and is refused). `scripts/library-upload.ts --file <pdf|txt> [--replaces "<title part>"]` runs the same pipeline from the command line. On 2026-09-27 three near-empty "books" were replaced this way: The Norwegian Method 3 → 171 sections (full PDF), Endure 13 → 308 (the 138 MB scanned PDF had ~12k chars of text; loaded from the athlete's earlier EasyOCR JSON with lone-word OCR noise lines removed), and the Norwegian research compilation 10 → 59 (now titled "The Norwegian Model…"). Library: 10 books, 2,485 sections. `scripts/load-book-pdf.ts` still has the old splitter bugs (collapses newlines before looking for paragraphs; chapter title swallows the chunk) — use the upload instead.

**⚠️ pdf-parse on Vercel (fixed 2026-09-27).** pdf-parse v2's pdfjs needs `DOMMatrix`, which Node on Vercel lacks. Imported at the top of `app/api/coach/resources/route.ts` it crashed the WHOLE route at module load — the Coach Library showed "Failed to load resources" and pasted-text uploads failed too, not just PDFs. Now: `pdf-parse/worker`'s `CanvasFactory` and `PDFParse` are imported lazily inside the PDF branch, and `next.config.ts` lists `serverExternalPackages: ['pdf-parse', '@napi-rs/canvas']` so the native canvas binary ships with the function (pdf-parse's documented Next.js + Vercel setup). Never import pdf-parse at module top in a route.

**User resources (`lib/rag/user-resource-retriever.ts`, `/coach/resources`):** Athlete-uploaded coach material. `POST /api/coach/resources` accepts either `application/json` (`{ title, content, ... }`) or `multipart/form-data` (PDF file via `pdf-parse`). Chunks via `lib/rag/chunker.ts`, embeds via `text-embedding-3-small`, writes to `runcoach.user_resources` + `runcoach.user_resource_chunks`. The book retriever calls `retrieveUserResources(userId, query, ...)` in parallel with its book search and merges results into the same "Methodology Guidelines" block — user resources go first so they win ties when the prompt truncates. Soft-delete via `DELETE /api/coach/resources/[id]` (sets `status='archived'`, retains embeddings).

**Supervisor UI:** The chat (`/coach/ask`) renders the supervisor envelope's warnings as a chip above each assistant bubble (`ShieldAlert` icon, warning codes inline). The `CoachHealthWidget` (7-day summary from `/api/coach/health`: calls, errors, avg critic score, preflight warnings with plain-language meanings, ceiling hits) lives on **Coach Reports → System** alongside the weekly `system_health` reports — moved off the dashboard 2026-09-27, since it describes the app, not the training. Its latency average counts interactive calls only; plan-builder calls (1-2 min each) are counted separately. Pre-flight severity has three levels: `info` (context, not a fault — `no_active_plan`, `no_planned_today` on a rest day) is still given to the model but is NOT counted in Coach Health and NOT shown as a chat chip; `warn` and `block` are. "No active plan" used to be a warning on every chat message (14 in a week) for one ongoing state. Chat book search is follow-up aware: a short reply (<12 words) is searched together with the coach's previous message, and any reply whose own search finds nothing is retried once with it — measured on the 6 follow-ups that had found NO books, all 6 now retrieve relevant ones. A step label for multi-call features goes in `coach_calls.task`, NEVER in `preflight_warnings` — the builder once tagged `builder:<task>` there and the widget reported 93 test calls as warnings.

**Prompt caching (post-restructure):** `COACH_STATIC_BLOCK` (persona + coaching rules, byte-stable, NO interpolation) travels as `cacheableSystemPrefix` in `callOpenRouter`/`streamOpenRouter` and carries the Anthropic `cache_control` breakpoint; `buildCoachDynamicBlock(context)` (RAG context + task line) is the uncached system message. Never interpolate anything per-request into the static block or the cache stops hitting. `buildEnhancedCoachSystemPrompt` still exists as static+dynamic concat for non-caching callers (grocky, plan-adjust).

**Request-scoped preloads:** `buildContext(userId, query, queryType, { plan, profile })` and `formatUserContext(userId, maxTokens, { plan, profile })` accept already-fetched rows (`null` = checked-and-absent, `undefined` = fetch internally). Routes fetch the active plan / profile once and thread them down — previously the plan was queried up to 3× per request. The Haiku query classifier only runs for `ask_coach`/`grocky` (user-authored text); fixed-string query types skip it.

**Post-response work:** telemetry (`logCoachCall`), the Haiku critic, and chat message persistence run inside `next/server after()` — off the critical path and platform-guaranteed (un-awaited promises are not). Response `supervisor.callId` is therefore always `null`; the callId lives on the persisted rows.

**Timezone rule:** server-side day/week boundary math MUST use `lib/utils/user-time.ts` (`nowInUserTz` / `dateInUserTz` / `userDateStr`, Asia/Jerusalem) — Vercel runs UTC and bare `new Date()` puts Sunday 00:00-03:00 IL into the previous training week. Client components may use `new Date()` (browser is already in the user's tz).

**Morning-after coach note:** both Strava sync paths (manual + cron) call `generateRunReaction` (`lib/ai/run-reaction.ts`, Haiku) after importing a run — a two-sentence coach reaction judged against the plan's workout for that date (`plannedWorkoutForRunDate`), stored in `runs.coach_notes`. Dashboard shows it for 36h. Always best-effort; never fails the sync.

**Readiness verdict:** `/api/coach/stats` returns `readiness: { verdict: GO|EASY|REST, reasons, fatigueScore }` computed by `lib/utils/readiness.ts` (pure function — fatigue score + yesterday's zone distribution + today's planned workout). Dashboard hero renders it as a colored badge. No LLM involved; the chat coach reads the same signals so app and coach stay consistent.

**Stats aggregates:** lifetime totals come from the `runcoach.run_totals(p_user_id)` RPC (count + sum in one call) — do not reintroduce the select-all-rows-and-reduce pattern.

**⚠️ HR zones: only 116 runs have them, and that is correct — do NOT "restore" the rest (2026-08-06).**

An earlier version of this note described the 2026-08-05 max-HR change (185 → 191, bands rescaled to `0-124 / 124-143 / 143-155 / 155-168 / 168-181 / 181-191`) as a *documented discontinuity between two valid band definitions*. That framing was wrong and dangerously reassuring. There was a **third population that was simply incorrect**.

The imported legacy rows (`garmin`, `garmin+tp`) carried corrupt zone data: 204 runs recorded time in **Z6 while their maximum heart rate never reached the Z6 floor** — tested against the *old* 175 floor precisely so the rescale could not explain it. In aggregate they claimed **83.5% of time above Z4 at an average HR of 149**, when Z4 begins at 150. The 2025 New York Marathon read Z6 44.3% on a run whose max was 182. The two populations this codebase computed itself (`strava_sync` 28% Z4+, `intervals_sync` 8.3%) were always sane.

Repaired 2026-08-06:
- **116 runs recomputed from their actual HR streams** against current bands, using the same `computeZonePercentsFromStream` the live sync uses. Impossible-Z6 count went 204 → **0**; average Z4+ 84% → **20%** at avg HR 143. This also removes the 2026-08-05 band split for these runs — one definition across the whole window the coach reads.
- **560 runs nulled.** No stream source exists for them anywhere, so they can never be repaired. Storing a number known to be wrong is worse than storing nothing: absent zones render as absent, wrong zones render as insight.

Snapshot of the pre-repair state: `runcoach._bak_20260806_run_zones`. `run_type`, `trimp` and `decoupling_pct` were untouched — `classifyRun` and TRIMP ran at ingest and are not recomputed here.

Consequence for anything reading history: **zone analysis is only valid for runs where `pct_z1 IS NOT NULL`** (116, roughly the last year). Weekly review and any intent-vs-actual zone comparison must scope to those and say so, rather than treating a null as zero.

`lactate_threshold_hr` stays **165** while intervals.icu holds **173**. The app's zones are %-of-max anchored so threshold does not feed them, but the divergence matters for intervals.icu write-back, where `Z4 HR` resolves against *their* threshold-anchored bands. The choice of %-of-max over threshold-anchoring was made against measured Z4+ distributions (a threshold model silently disabled `readiness.ts` rule 3) — see `docs/intervals-icu-implementation-spec.md` Phase 2b before revisiting.

**Ingestion (`lib/ingest/`):** `upsertRun` is the single owner of per-activity mapping for every provider — zones, classification, TRIMP, pace, laps, coach note. Providers only produce a `NormalizedRun`; `lib/ingest/strava.ts` and `lib/ingest/intervals.ts` are the mappers. Matching is exact `filename`, else same user within 4h and 2% distance, else insert. The window must exceed 3h: a row storing Israel local time sits exactly 3h from truth in summer, so `<= 3h` has zero margin for the very corruption it exists to catch. Distance ±2% does the real discriminating — verified there are no same-distance doubles within 4h anywhere in the history. Updates are **fill-null-only** and always preserve the row `id` (`run_feedback.run_id` and `laps.run_id` are both ON DELETE CASCADE). Laps, HR streams and the active plan are passed as thunks so they are fetched only on the paths that need them. The patch decision lives in the pure `buildEnrichPatch`, so the rules are testable without a database.

**The one exception to fill-null-only:** on a **fuzzy** match, when `ctx.identityIsAuthoritative` is set, `date` and `filename` are overwritten. A fuzzy match is itself proof the stored row disagrees with the incoming one. This exists because ~50 `strava_sync` rows (2025-12-15 → 2026-06-29) store Israel local time in a timestamptz column; fill-null-only can never repair that since `date` is never null, and a 2-3h late timestamp puts a 22:30 run into the next training day and week. `filename` is included so those rows converge to the `icu_` id instead of being re-fuzzy-matched forever. Set it **only** for intervals.icu (timestamps come from the Garmin FIT file) — if Strava did it too the two providers would rewrite each other's identity on alternating syncs and never converge.

**Cron debugging notes (learned the hard way, 2026-08-06):**
- **Hobby runtime logs retain roughly 1 hour.** `vercel logs <deployment>` showing no invocation of a path proves nothing about what happened earlier in the day — absence of evidence only. Use the dashboard's Settings → Cron Jobs tab, which lists what is actually registered and has a per-job **Run** button plus **View Logs**.
- **Hobby crons have a 1-hour flexible window.** A `0 15 * * *` job fires somewhere in 15:00–16:00 UTC, so a job "missing" its minute is normal.
- **Changing an env var does not affect running deployments.** Values are baked in at build time, so `CRON_SECRET` (or any other) needs a redeploy before the deployed function sees it. In the gap, Vercel Cron sends the *new* secret while the function checks the *old* one, and every cron 401s.
- Three cron entries are registered fine on this project (2× intervals-sync + weekly-health-audit); an earlier claim here that Hobby caps at 2 was wrong.

**`laps` holds two populations, and they DO align — but verify, don't assume.** Strava-era rows (483) look like per-kilometre autosplits and intervals.icu rows look like detected work/recovery blocks, which suggests they are independent segmentations that must never be index-matched. They are not independent: both derive from the same Garmin FIT lap records, one source read by two consumers. Measured, aligned runs agree on per-lap distance to within 5–30 m. When intervals.icu's auto-detection merges or adds a segment, the lap *count* changes, which is what makes an equal-length check a working proxy.

But it is only a proxy. `scripts/backfill-lap-fields.ts` verifies the property directly — every lap must match on `distance_km` within 50 m before anything is written by `lap_number`. That is not academic: it rejected 2026-06-16 at 84 m drift, a run the count check would have accepted and written wrongly.

**Intent vs actual (`lib/utils/zone-discipline.ts`):** compares the *planned* workout (via `plannedWorkoutForRunDate`) against `pct_z1..z6`. Intent must come from the **plan's** `type`/`target_hr`, never from `runs.run_type` — `classifyRun` derives that from the zone distribution, so comparing them measures the classifier against its own input. Only the zone *label* is parsed; the bpm in `"Z1-Z2 (125-145)"` predates the max-HR-191 rescale and often disagrees with its own label. Easy sessions are judged against the 80/20 band (Z1+Z2) rather than a literal `Z1` prescription; quality sessions also get their **work-zone share** rendered, because a wide `Z2-Z4` band (124–168 bpm) otherwise lets a warm-up count as compliance — 2026-08-03 read 96% in band with only 15% at Z4. One flag each way, both at 30%, applied symmetrically rather than inventing a second number.

**Weekly scorecard coverage gate — 0.5, and it is correctly calibrated (measured 2026-08-08).** `MIN_JUDGED_COVERAGE` in `lib/utils/scorecard.ts` withholds the colour when fewer than half a week's runs are judgeable. A grey zone-discipline row is therefore **not** evidence the threshold is too strict, and lowering it is the wrong response. Measured across the whole active-plan window:

| | |
|---|---|
| planned days so far | 42 (**35 = 83%** with a parseable `target_hr`; the other 7 are rest days, which cannot be judged anyway) |
| runs in window | 30 (**30 = 100%** with valid zones — the plan began after the intervals.icu era, so the 560 nulled rows predate it entirely) |
| runs on a planned day | 24 (80%) |
| judgeable | **23 = 77%** |

So neither zones nor `target_hr` is the constraint, and there is no plan-generation fix to make. The binding constraint is **day alignment**: the week of 2026-08-02 read 1-of-3 only because the athlete ran Sun/Mon/Thu against a plan prescribing Mon/Wed/Fri/Sat. That is an outlier, not the norm.

An earlier version of this note asserted the opposite — that most weeks would render grey because `target_hr` and zone coverage were thin — inferred from that single week without measuring the window. Same failure shape as the n=1 season baseline and the two-August-medians estimate: **generalising from one observation is this codebase's most persistent remaining error**, now that the data itself is sound. Measure the window before drawing the curve.

**Mountain race build (2027-07-03, 21K/1300m) — see `docs/mountain-race-plan.md`.** Full handoff reference plus a chunked implementation plan. **Decided 2026-09-03: the app tracks and advises; it does NOT generate the mountain plan** (the athlete builds it externally), so that doc's Chunks 4 and 6 — trail plan type, plan-form UI — are out of scope. Chunk 1 (elevation) is done; Chunks 2 (pace-band gates), 3 (trail methodology into RAG) and 5 (indoor alternative) remain.

⚠️ **RAG vector search was broken for every AI call, and failed silently. Fixed 2026-09-03.**

`match_instructions`, `match_user_resources`, `search_instructions` and `search_instructions_filtered` pinned `search_path = pg_catalog, public, runcoach` — hardening against a mutable search_path — but the `vector` extension lives in the **`extensions`** schema. pgvector's `<=>` was therefore unresolvable inside the function bodies, and every call raised `operator does not exist: extensions.vector <=> extensions.vector`.

So book methodology, coach workouts and user resources all returned nothing, and **Ask Coach, weekly review and plan generation were running on the model's priors alone.** The corpus was intact the entire time: 7 books, **1,452 instructions, every one embedded**, none of it reachable.

It survived because it fails **soft** — each retriever catches the error and continues with an empty layer, so the only symptom is a console warning on a server nobody watches. What exposed it: a generated plan cited *"Training for the Uphill Athlete"*, a book not in this database. With an empty RAG layer the model had nothing real to cite and confabulated a plausible source. After the fix, the same prompt cited 80/20 and the Norwegian Method — both genuinely loaded.

Two lessons worth keeping:
- **A silent-degradation path needs a loud check.** The supervisor pre-flight is meant to flag "no book sources for plan generation" and did not save us. If this class of failure matters, that check deserves attention.
- **A fabricated citation is a symptom of an empty context, not just a model quirk.** It is the cheapest available signal that retrieval died.

Fix: `supabase/migrations/20260903_fix_vector_search_path.sql` adds `extensions` to each path, still pinned. **Any future function doing vector work in `runcoach` needs `extensions` on its search_path.**

⚠️ **And that was only HALF the bug. `BOOK_MATCH_THRESHOLD` was 0.7, above the corpus maximum.** Fixing the search_path made the operator resolve; the book layer stayed empty, because nothing in the corpus ever scores 0.7. Measured against the real 1,452 chunks with `text-embedding-3-small`:

| threshold | chunks matched | |
|---|---|---|
| 0.70 | **0 (0.0%)** | the shipped book value |
| 0.65 | **0 (0.0%)** | the shipped user-resource value |
| 0.50 | 20 (1.4%) | |
| **0.45** | **72 (5.0%)** | now |
| 0.40 | 173 (11.9%) | too loose — stops discriminating |

Across four representative queries the single best match anywhere in the corpus ranged **0.518–0.672**. Both shipped thresholds were unreachable, so **the book layer returned nothing for the entire life of the feature**, independently of the search_path bug. Two unrelated faults, identical symptom, because an empty RAG layer is silent.

Verified after: book layer **0 → 26,040 tokens** across 20 chunks from 4 books; plan-gen system prompt **20,703 → 122,742 chars**; Ask Coach now retrieves *The Norwegian Method* for a double-threshold question and *Run Elite* / *Endure* for a mountain long-run question. `scripts/measure-rag-thresholds.ts` re-runs the measurement — **the right threshold is a property of the embedding model and the corpus, so re-measure if either changes; never pick it by intuition.**

**A near-miss worth recording.** After the search_path fix the regenerated plan cited "80/20" and "Norwegian Method", and that was briefly taken as proof retrieval worked. It was not: both are named in `COACH_STATIC_BLOCK`, so the model could produce them with an empty book layer. **A plausible citation is not evidence of retrieval** — check `bookContext.tokenCount` and `.sources`, which is what actually settled it.

**Verifying prompt changes end to end:** `scripts/verify-plan-generation.ts` runs the real plan-generation path (one Opus call) and writes nothing to the database. Unit tests cannot answer whether the model actually emits the fields a prompt asked for; this can. Its first run caught both the RAG breakage above and the fact that the new elevation/indoor fields had no UI to render them.

Measured result of the 2026-09-03 verification run — 12-week trail plan, 4 days, 21K/1300 m: 12/12 weeks carried `total_elevation_gain_m`, 48/48 workouts carried `elevation_gain_m` and `indoor_alternative`, **zero sessions scheduled outside the four selected days**, and the down weeks cut vert harder than km (week 3→4: vert −45%, km −20%), which is what the prompt asks for and the thing most likely to be quietly ignored.

⚠️ **The pace band is gradient-gated as of 2026-09-03 — power-hiking counts as work on a climb.** `decoupling.ts` and `efficiency.ts` keep the 3–12 min/km band on ordinary runs and raise the ceiling to `MAX_PLAUSIBLE_PACE_MIN_KM_STEEP = 22` when `vert_per_km >= 15` (the same `VERT_SESSION_MIN_M_PER_KM` the classifier uses — one definition, shared).

Gated on **gradient, not run type**, and the data chose that: of 13 laps above 12 min/km in this athlete's history, the contaminating ones (28.5–88.9 min/km, all 70–85 s fragments covering 21–49 m — standing still on a stair session) come from runs at **6.7 and 10.1 m/km**. Flat runs, which never qualify for the raised ceiling. Blanket-excluding climb sessions by type would instead silence the case that matters most: a climb session that never reached its target effort.

22 is **provisional** — above the 15–20 power-hiking band rather than inside it, chosen with no mountain-session data to calibrate against. Re-measure once a real climbing block exists.

⚠️ **`MIN_LAP_DURATION_SEC = 30` applies ONLY on the steep path**, and that restriction is load-bearing. It exists because the raised ceiling would admit the 1–3 second, 3-metre lap fragments that resolve to 13–29 min/km. Applied globally it would drop **79 laps across 50 runs** that sit under 30 s *inside* the normal 3–12 band, silently restating half the stored decoupling values under a rule they were never computed with. (It was written globally first, with a comment asserting it was a no-op. Measuring proved otherwise — the assertion had been made before the query.)

Unmeasured gradient always keeps the road ceiling. Absent is not steep.

**Elevation reaches the watch (2026-09-03).** `planWorkoutToDescription` emits the climb target and the indoor alternative as **notes**, never as workout steps — intervals.icu's parser has no elevation syntax and inventing one risks malforming the workout. The climb also enters the event *name*, since on a calendar that is all the athlete sees without opening it. A test pins that the parser-facing half of the description stays byte-identical whatever notes are attached; that half was verified live and must not drift.

**The scorecard has a `climb` row (2026-09-03).** Coloured only when there is something to judge against — the plan's own per-day `elevation_gain_m` first, else the active macro phase's `weekly_vert_range_m`. With neither it reports the number and withholds a verdict, exactly as the aerobic-control row does. An unmeasured week renders "Not measured", never 0 m scored red. A week mixing measured and unmeasured runs says its total is a floor. `formatScorecard` and the UI both iterate rows generically, so the row reaches the weekly review prompt and the page with no further wiring.

**📄 Start here: `docs/app-state-2026-09-27.md`** — plain-language record of the 26–27 September session (20 commits, 99 files): new books and expert plans, strength in plans, the staged plan builder, season → phases with KPIs, treadmill entry, book upload, model changes and costs, the NanoGPT fallback, every bug found and mistake corrected, and what is still open. The earlier record, `docs/app-state-2026-09-03.md`, covers the session before.

⚠️ **An indoor session reporting 0 m of climb is UNMEASURED, not flat (2026-09-04).** Most treadmills never transmit incline to the watch, so a 700 m vertical workout is commonly recorded as 0 m. `indoorAwareGain()` converts that 0 to null at ingest for anything matching `treadmill | indoor | הליכון | stairmaster | gym` or `VirtualRun`. Storing the zero would make a hard vertical week read as flat — red climb row, and the Saturday loop firing `vert_below_phase` on a week executed perfectly. A treadmill that *does* report incline is believed; outdoors, 0 m stays a real measurement.

**The race-demand block reasons about the EVENT, not just its numbers.** It renders average **grade percent** alongside m/km (percent is what a treadmill console and a trail sign show), states plainly that 1300 m over 21 km is *not a hilly half marathon*, and — gated on grade ≥5% — declares power-hiking the **primary technique rather than a fallback**, because a running stride on sustained steep grade pushes HR past threshold within minutes. It also supplies `TREADMILL_VERT_TABLE` so indoor vertical can be prescribed as grade + time with the metres it yields (12% at 5 km/h ≈ 600 m/hour), since the athlete's flat coastal terrain cannot produce race-grade load. Verified: a generated block produces a plan whose own methodology line reads *"This is NOT a hilly half plan — it's a mountain race plan that happens to be 21km."*

⚠️ **The supervisor's retrieval check is ALWAYS-ON, and must stay that way (2026-09-04).** `no_book_sources` used to live under `case 'plan_generation'` only. During the months RAG was dead it fired exactly once — on the single plan generation ever run — while 14 `ask_coach`, 6 `daily_advice` and 3 `plan_review` calls logged a clean preflight. **The most-used paths were the least monitored.** Zero sources is now unambiguous: with the threshold calibrated to 0.45 against the real corpus, an empty result means retrieval FAILED, not that nothing matched.

⚠️ **`cache.addAll` in `public/sw.js` is atomic — never reintroduce it.** The precache listed two `.png` icons that do not exist (the files are `.svg`), so **every install cached nothing at all**, including `/offline` itself; going offline showed the browser's error page. The `.catch` swallowed it into a `console.log`. Assets are now cached individually via `Promise.allSettled` and failures are logged by name, so one missing file costs that file rather than the whole offline capability. Bump `CACHE_NAME` whenever the list changes.

**QA entry points:** `bun test` (71 unit tests, including `lib/ai/prompt-contracts.test.ts`, which builds the real prompts and fails on hardcoded defaults) and `scripts/qa-smoke.ts` (33 read-only functional checks against live data — profile, runs, readiness, wellness, training state, scorecard, all three RAG layers, supervisor, plan/season, triggers, intervals.icu, watch push, and the CalTrack schema boundary). **Neither covers auth-gated HTTP handlers or UI click-through.**

**Strava's nav link was removed 2026-09-03** at the athlete's request; the cutover to intervals.icu is confirmed. The page and all routes remain reachable at `/coach/strava`, and `runcoach._bak_20260806_strava_tokens` still holds a working refresh token. Removing the link was a navigation decision, not a deletion.

⚠️ **`run_feedback.followed_plan` is TEXT — `'yes' | 'no' | 'modified'` — not a boolean.** It was typed `boolean` in `lib/db/types.ts` while the column, the form and the Zod schema all used strings, and the single consumer tested `=== false`. That can never be true, so the app's only EXPLICIT plan-adherence signal never once reached the coach; everything else about adherence is inferred from HR zones. Fixed 2026-09-03, with `'modified'` rendered distinctly from `'no'`.

**Adaptation runs as THREE loops on three clocks (2026-09-03).** Do not collapse them into one mechanism.

| loop | cadence | scope | entry point |
|---|---|---|---|
| Readiness | daily | today only; never rewrites the plan | `readinessForUser` |
| Micro | Saturday 18:00 UTC cron | re-shape the next 1–3 weeks inside the current block | `/api/cron/weekly-proposal` |
| Macro | per block, or on trigger | phase targets + remaining season shape | `runcoach.macro_plans` |

**`lib/coach/training-state.ts` is the single assembly point all three read**, plus Ask Coach via `context-builder`. Weekly volume/vert buckets, adherence against stated training days, efficiency, decoupling percentile, CTL/ATL form, readiness, climbing baseline. Same discipline as `readinessForUser`: assembled once so the coach's answer and the plan's adjustment cannot reason from different numbers.

Its `gaps[]` array is load-bearing — it renders in prompts under *"WHAT COULD NOT BE MEASURED — treat these as unknown, never as fine"*. A reader must be able to tell "training is going well" from "we cannot see how training is going".

⚠️ **A partial week is not a data point.** The in-progress week is kept in `weeks[]` (it is real) and excluded from every trend via `isPartial`. Counting it made volume read "falling 52%" on an ordinary Thursday — the trend was measuring the calendar. The 10% `TREND_DEADBAND` is wide on purpose: one missed 8 km run out of 30 km is 27% on its own.

**Macro plans hold NO workouts.** Measured at **~623 output tokens per plan-week**, 48 weeks is ~30k against a 16k ceiling — but the real objection is that a prescribed session 11 months out is fiction. Phases carry ranges, a `capability`, and **`exit_criteria`**: a phase advances when its criteria hold, not when its weeks elapse, so a slow adapter extends base instead of being marched into a build phase. Criteria must be checkable against `TrainingState`; the prompt forbids absolute decoupling bands for the usual reason. `suggestedPhaseCount` scales by proportion (1 phase under 8 weeks, 5 over 40) so 11-month, 6-month and 4-month requests share one model. Revisions are new rows; one active macro per user via a partial unique index.

⚠️ **The weekly loop PROPOSES, it never applies.** `plan_proposals` rows are accepted by the athlete through `/api/coach/proposals`; the cron never writes to `training_plans`. **`status='no_change'` rows are written deliberately** — without one, a quiet week is indistinguishable from a broken cron.

**Hysteresis in `lib/coach/proposal-triggers.ts`, and "no change" is the expected weekly outcome.** An urgent trigger (ramp >30%, collapse <−30%) stands alone; any soft signal needs a second to agree. If this proposes most weeks the thresholds are wrong, not the athlete — `proposal-triggers.test.ts` pins an ordinary week producing nothing. Unmeasured vert never fires the phase-floor trigger, and a null adherence rate (unset `training_days`) is a gap, never 0%.

**Saturday, not Sunday.** The training week runs Sunday–Saturday, so the proposal lands after the week closes and *before* Sunday's session — the only moment it can change anything. `0 18 * * 6` = 21:00 Israel in summer. ⚠️ This is the **4th** Vercel cron on a Hobby project; 3 were known to register fine, 4 is unverified. If it is rejected, fold it into `weekly-health-audit` and move that to Saturday.

Verification scripts, all read-only unless flagged: `scripts/show-training-state.ts`, `scripts/verify-macro-plan.ts` (`--commit` to save), `scripts/verify-weekly-proposal.ts`, `scripts/verify-plan-generation.ts`, `scripts/measure-rag-thresholds.ts`.

**Plan generation is elevation-aware as of 2026-09-03 (Chunks 4 + 5).** The app DOES generate the mountain plan — an earlier note here said track-and-advise only; that was a misunderstanding, corrected by the athlete.

`buildRaceDemandBlock()` (`lib/ai/coach-prompts.ts`, pure, tested in `lib/ai/race-demand.test.ts`) renders a RACE DEMAND section into the plan prompt whenever `raceElevationGainM` is supplied. It computes the race's gradient rather than leaving the model to divide, and states the gap against the athlete's **own measured climbing** from `getClimbBaseline()` (`lib/db/runs.ts`, 120-day window). For this race it renders: *61.9 m/km, 3.1× his steepest run ever, 7.0× his median* — then instructs that gradient is the limiter and distance largely in hand. With no measured history it says so and starts conservatively instead of inventing a ramp.

Returns `''` when there is no elevation target, so **road plans are completely unaffected by this path** — a test pins that.

New plan inputs: `raceDistanceKm`, `raceElevationGainM`, `terrainAccess`, plus a `'Trail / Mountain'` plan type. The form shows the computed gradient live as you type. Terrain access is load-bearing, not decoration: a plan prescribing hills the athlete cannot reach is a plan that will not be run.

⚠️ **Elevation and indoor fields survive a plan adjustment by CODE, not by prompt.** `carryForwardElevation()` in `plans/adjust/route.ts` fills `total_elevation_gain_m`, `elevation_gain_m` and `indoor_alternative` from the existing week when the adjusted week omits them. An adjustment rewrites whole weeks from model output, so without this a single mid-block tweak silently turns a mountain plan into a road plan. An adjusted week that *does* carry elevation wins outright — that is a deliberate change. Do not "simplify" this into a prompt instruction; "the model usually remembers" is not a property to rest on.

**Every prescribed workout carries an `indoor_alternative` (Chunk 5).** The rule lives in `COACH_STATIC_BLOCK`, so it reaches `/coach/ask`, Grocky and plan generation alike — `buildEnhancedCoachSystemPrompt` alone would have missed the main chat. Equipment vocabulary: stairs, incline treadmill (הליכון), stair climber, spin bike, rowing erg, gym strength. **The rule requires stating the limit**: stairs, incline treadmill and stair climber train the CLIMBING half only and cannot reproduce descent, so a climb session's indoor substitute must be paired with eccentric work and must not be presented as complete.

⚠️ **Three separate places hardcoded Monday/Wednesday/Friday day anchors** — `COACH_STATIC_BLOCK` and BOTH plan-prompt builders (the plan-prompt copies sat at the very END of the prompt, after the training-days parameter, so they were overriding it). All three now defer to the supplied days and state the Israeli working week explicitly. If a fourth appears, the symptom is a plan scheduled on days the athlete never selected.

**Also fixed in passing:** `/coach/plan` offered "5K Speed" and "Maintenance", neither of which was in `planGenerationSchema`'s enum — both 400'd on submit. Two of six plan types were broken and nothing surfaced it.

**Elevation is captured end to end as of 2026-09-03 (Chunk 1).** `runs.elevation_gain_m` / `elevation_loss_m`, generated `runs.vert_per_km`, and `laps.elevation_gain_m`; mapped in `lib/ingest/intervals.ts`, written by `upsertRun`, rendered by `lib/utils/elevation.ts`. Probed live over 130 activities / 400 days before anything was written:

- `total_elevation_gain` **and** `total_elevation_loss` are both on the activity **summary** payload `getActivities` already fetches — 128/130 each. Descent costs no extra request and no altitude stream. Do not add one.
- `average_vertical_speed` (VAM) is present on **9/130** and is deliberately **not** stored. There is therefore no vertical-TRIMP and no climb-rate metric; a column populated 7% of the time reads as a metric and behaves as a coin flip.
- **Lap gain does NOT sum to run gain, and must never be used to derive it.** Measured 130.4 m summed across laps against 210.9 m on the activity (i172836000). intervals.icu laps are auto-detected work/recovery segments that do not tile the activity, so the shortfall is uncovered time, not an error. Lap elevation answers "which segment climbed", nothing else. There is no per-lap loss field (0/191 sampled).
- **No Minetti GAP, ever.** `gap_pace_min_km` already holds grade-adjusted pace from intervals.icu. A second grade adjustment computed in `elevation.ts` would be the "second, non-comparable measurement in the same column" this file already warns about for decoupling.

The climb bands (`CLIMB_BANDS`: Flat <5, Rolling 5–15, Hilly 15–25, Mountain ≥25 m/km) are **quantiles of this athlete's own 128 measured runs**, not general trail categories — min 0.0 · p25 7.5 · median 8.8 · p75 10.9 · p90 11.7 · **p95 12.0** · max 20.2. Race day is **61.9 m/km**: ~3× his steepest single run and 7× his median, which is why gradient rather than distance is the training problem. **`Mountain` has zero members in his history and that empty band IS the training gap** — `lib/utils/elevation.test.ts` asserts it stays empty, so a future change that lowers the floor to "fill" it fails the suite on purpose.

`classifyRun` gained two `RunType` values, `'Vert / Hill'` and `'Trail Long Run'`, gated at `VERT_SESSION_MIN_M_PER_KM = 15` — which fires on **1 of his 128 recorded runs**. That rarity is the calibration: a threshold already matching a third of his history would be measuring his neighbourhood.

**The threshold was 12 first, and 12 was wrong — a worked example of why a band must be placed after measuring, not before.** His **p95 is exactly 12.0**, so that floor landed on top of a dense cluster: seven runs cleared it, and five were ordinary 5–8 km easy and recovery runs at 12.0–12.7 m/km, where a one-metre difference in recorded climb flips a run between "easy" and "hill session". A boundary inside the bulk of a distribution does not classify, it coin-flips. The error came from interpolating between two probe buckets (`>=10: 49`, `>=15: 1`) instead of measuring at 12 — the same generalise-from-too-little failure this file already records twice. `lib/utils/elevation.test.ts` now pins the cluster below the line.

Related and load-bearing for reading his history: **his two steepest runs (20.2 and 13.3 m/km) are both from a New York trip. His steepest run in Israel is 12.7.** The terrain reachable from home is one band wide, which is why the local trail loops in `docs/mountain-race-plan.md` (26–47 m/km) matter — every one of them exceeds anything in his history. The gate sits *after* the Intervals and Race name checks (those describe how a session was organised, which grade does not override) and *before* everything else. Absent elevation never reaches it, so pre-2025-08-05 runs classify exactly as before.

⚠️ **`runs.vert_per_km` is a GENERATED column.** It is excluded from `EXISTING_COLUMNS` and from every insert and patch in `upsert-run.ts`; writing to it errors.

**Backfill (run 2026-09-03):** 128 runs gained gain+loss, 1,168 lap rows across 99 runs gained per-lap gain. Snapshots: `runcoach._bak_20260903_runs` / `_bak_20260903_laps`.

Two scripts, because `upsertRun` gates lap writes on `countLaps === 0` (correctly — that gate is what stops a re-sync duplicating a lap set), so existing lap rows are invisible to the run backfill. `scripts/backfill-lap-fields.ts` is the one-shot for those, and its alignment guard refused 28 runs (21 lap-count mismatch, 7 over the 50 m per-lap drift limit); worst drift accepted was 29 m.

**Run-level backfill:** no new script. `scripts/backfill-intervals.ts --rerun` fills the new columns through `upsertRun`'s ordinary fill-null-only enrichment — the reason the backfill goes through production code rather than owning its own mapping. Its re-run acceptance check no longer hardcodes a row count (it asserted 680 against a table that grows daily, which would have failed for no reason and taught the next person to pass `--no-verify`); it now asserts the count is *unchanged*.

⚠️ **Chunk 2 is now the live risk.** `decoupling.ts` and `efficiency.ts` both discard laps outside **3–12 min/km** and refuse outright when too much of a session falls outside it. Power-hiking sits at 15–20 min/km. The moment mountain training starts, both of the app's "is the training working" metrics go dark on exactly the sessions that matter, and the scorecard's aerobic-control row reads "not computed" most weeks. Recorded fix direction: widen the band for high-`vert_per_km` runs (or for the two new run types) — do **not** raise the global 3–12 ceiling, which would reintroduce the walking-lap contamination that band exists to prevent, and do **not** blanket-exclude climb sessions, which would silence the one case that matters most (a climb session that never reached its target effort).

**`athlete_profile.training_days` — corrected 2026-09-03, and now overridable per plan.**

The field was stale for months (`"Monday (quality…), Wednesday, Friday (long)"`) and silently capped the weekly scorecard's judgeable coverage, since a plan built on the wrong days produces runs that fall on unplanned days and cannot be graded. The athlete's actual week, stated by him: **Sunday, Monday (quality — VO2max, threshold, tempo, fartlek), Wednesday, Friday (long run)**. Profile updated to match.

Measured over 120 days in Asia/Jerusalem, which supports it:

```
Sun 13 (5.2 km avg) · Mon 13 (6.9) · Wed 12 (5.0) · Sat 7 (9.5) · Fri 6 (9.7) · Thu 4 (7.7) · Tue 3 (8.7)
```

Note Friday: only 6 runs, but the **longest average distance of any day** (9.7 km, max 12.4) — the long run is real, just less frequent, with Saturday acting as its overflow. An earlier version of this note, drawn from a single 9-week plan window, said Friday was effectively dead and inferred an Israeli-weekend explanation. Over a 120-day window that reading was too strong. **Same lesson as the rest of this file: measure the window, not the sample** — including when the sample seems to tell a tidy story about someone's life.

**Days are now a per-plan input, not just a profile field.** `planGenerationSchema` takes `trainingDays` (array of canonical weekday names) and `trainingDayNotes`; `/coach/plan` has a Sunday-first day picker prefilled from the profile. `resolveTrainingDays()` in both generate routes prefers the request over the profile — the request is the athlete stating his days at the moment he is actually deciding, which beats a field nothing validates. **Choosing days in the form does NOT rewrite the profile**, so a one-off block (travel, a heavy work month) cannot silently become the permanent default.

Two related fixes shipped with it:
- `COACH_STATIC_BLOCK` **hardcoded Monday/Wednesday/Friday day anchors**, which would now contradict the profile. The static block is byte-stable and cannot be interpolated per request, so it now instructs the model to use the days supplied in the dynamic context and to *ask* rather than assume when none are given. It also states the Israeli working week explicitly, since Sunday-is-a-workday and Friday-Saturday-is-the-weekend are exactly the assumptions a model trained on Western schedules gets backwards.
- Both plan prompts defaulted to the literal string `'Mon, Wed, Fri, Sun'` when days were absent — a hardcoded guess rendered as data, which is how the stale value went unnoticed. They now render `NOT SPECIFIED` and tell the model to say so. `dayBudgetNote()` additionally warns when `runsPerWeek` exceeds the number of available days, so doubling up is a visible choice rather than the model quietly scheduling onto a day never offered.

**The active plan was deactivated 2026-09-03** (Half Marathon, `5de0dbf5…`, started 2026-06-13). The athlete follows an external plan; while that row was `active` it drove readiness rules, the morning-after coach note and the scorecard's zone-discipline row, all grading him against a plan he was not running. With no active plan those fall back to load-and-recovery only, which is honest.

**Aerobic decoupling is GRADE-ADJUSTED — do not compare it to a TrainingPeaks number.** `runs.decoupling_pct` is computed in `lib/utils/decoupling.ts` from per-lap `gap_pace_min_km`, not raw speed, and `decoupling_method` records that (`lap_gap`). Raw Pa:HR is confounded by terrain: this athlete's quality sessions all climb out and descend back, so raw speed rises for free in the back half and *understates* decoupling; his steady runs lean the other way (Easy −14.6 s/km, Long Run −16.2 s/km of uphill adjustment). Gates: ≥6 laps carrying both pace and HR, laps outside **3–12 min/km** discarded, refusal when >10% of session duration is discarded, halves within 40–60% of total time, and `Intervals`/`Fartlek` excluded entirely since work/recovery structure swamps the signal.

The pace band is load-bearing, not tidiness. Without it, laps at 88.9 / 36 / 29 min/km — standing still, stairs, walking — were averaged in as "slow running". Six of 68 runs contained them and averaged **21.0%** against **6.0%** for everything else, occupying the whole top of the distribution; a stair workout ranked as the athlete's worst aerobic session. Duration-weighted HR does not protect against this: a 59-second lap at 88.9 min/km contributes real time and almost no distance, which is what collapses the second half's efficiency factor. No raw-speed fallback — a second, non-comparable measurement in the same column is how a metric quietly becomes meaningless.

**Friel's <5 / 5–8 / >8 bands are NOT applied as verdicts.** They are defined on raw Pa:HR and calibrated on other athletes. Measured on this athlete's own 66 runs: median 6.5%, and 25 runs exceed 8% — so applying them unchanged would label a third of his easy and long running "went too hard". That may be true (rebuilding at CTL 17.7 through an Israeli August, thermal drift raises Pa:HR exactly this way) or the threshold may not be his; there is not yet enough history to tell. The formatter therefore renders his own **percentile and median**, not a colour. Revisit once a season of data exists.

**⚠️ GAP + cadence changeover — 2026-08-06 (third documented discontinuity).** `runs`/`laps` gained `gap_pace_min_km` and `cadence_spm`. Every `coach_reports` row written *before* this date judged pace with no grade adjustment, so its pace commentary can be wrong in a specific, knowable direction: on net-descending terrain raw pace overstates the work by 36–48 s/km. The 2026-08-03 "Threshold Intervals" session reads 6:17/km raw but 7:05/km grade-adjusted — easy-run effort, which is why HR never passed 166. Do not treat older reports as contradicting newer ones; they were computed from strictly less information.

Two unit conventions that are load-bearing. `gap_pace_min_km` is **min/km**, matching `avg_pace_min_km` beside it, though the API returns `gap` as m/s — converted once at ingest so the two columns subtract directly. `cadence_spm` is **steps per minute (both feet)**; intervals.icu reports `average_cadence` as one-leg rpm (observed 56.2–83.6), doubled once at ingest via `toCadenceSpm`, which guards on `<120` so a source that ever reports true spm is not doubled again. Do not double it a second time anywhere downstream.

**⚠️ `runs.data_source` is not provenance for enriched fields.** After the 2026-08-06 intervals.icu backfill, 98 pre-existing rows were enriched in place (laps, zones, corrected timestamps, `icu_` filename) while `data_source` still reads `garmin` / `garmin+tp` / `strava_sync` — fill-null-only never overwrites a non-null column. Only the 19 rows *inserted* by that backfill say `intervals_sync`. So the column records **who created the row**, not where its current contents came from. `filename LIKE 'icu\_%'` (117 rows) is the reliable indicator of intervals.icu involvement. This reads like a bug and is not one; do not "fix" it by rewriting `data_source`, which would destroy the original-provenance record.

**Strava is disarmed, not removed (2026-08-06).** `runcoach.strava_tokens` was emptied (row preserved in `runcoach._bak_20260806_strava_tokens`, refresh token intact). Reason: `master` still schedules `/api/cron/strava-sync`, whose old code matches on `filename = strava_{id}` — but all 117 of those rows now read `icu_...`, so it would find nothing and INSERT up to 117 duplicates. The cron loops over `strava_tokens`, so zero rows makes it a structural no-op. Once this branch merges, `vercel.json` no longer schedules it and the token row can be restored if Strava is ever wanted again. All Strava code and the `/coach/strava` page remain in place.

**Treadmill sessions / manual run data (2026-09-27).** On the log page the selected run has a "Treadmill / fix data" editor: mark it as a treadmill session and enter distance, duration and total climb, or work the climb out from grade × speed × time (`inclineSession`, the same arithmetic the planners use). `PATCH /api/coach/runs/[id]` (`lib/utils/treadmill.ts`, pure) writes the entered values into the normal columns so every reader — weekly climbing, phase KPIs, scorecard, coaches — uses them with no special case; the fill-null-only sync never overwrites them. Pace is recomputed; a treadmill run gets `elevation_loss_m = 0` (a belt never descends — a real zero) and `gap_pace_min_km = null`. The watch's ORIGINAL values are kept in `runs.manual_edit.original` from the first edit onward, so "Restore watch data" always restores the watch. Coaches see `[treadmill — distance/climb entered by athlete]` beside the run. `vert_per_km` is a generated column — never write it. There is no add-a-run-from-scratch screen; treadmill runs arrive from the watch and are corrected here.

**Garmin Personal API — a second wellness source (2026-10-24).** `lib/garmin/` (client, sync), `lib/ingest/garmin-wellness.ts` (pure mapper), `lib/db/garmin-wellness.ts`, tables `runcoach.garmin_tokens` + `runcoach.garmin_daily_wellness`, connect card on `/coach/intervals`. Plan and measurements: `docs/garmin-wellness-plan.md`, `docs/garmin-personal-probe-findings.md`. It does NOT replace intervals.icu: the Personal API is read-only (no workout push) and has no CTL/ATL; intervals.icu keeps activities, laps, GAP and the watch push.
- **Own table, on purpose.** `upsertWellnessDays` overwrites `daily_wellness` rows in full on every intervals.icu sync; Garmin values stored there would be erased. `hrv` / `resting_hr` / `sleep_secs` / `sleep_score` stay owned by `daily_wellness` — measured identical to Garmin's on 14/14 days, same wake-date attribution — and the copies in `garmin_daily_wellness` must never feed a baseline. Garmin adds only what intervals.icu lacks (it returned body battery / stress / SpO2 empty on 366/366 days): body battery (incl. at wake), stress, sleep stages + components, HRV status and baseline band, sleep respiration / SpO2 / HR, sleep need.
- **Token gotcha:** the exchange takes `Authorization: ApiKey <key>` ONLY — `Accept: application/json` returns 406, which reads like a key problem. Token lasts 24 h, no refresh token; it is cached encrypted in `garmin_tokens` and re-exchanged once on a 401.
- **Range limits (measured):** HRV and v2 daily summaries take 60 days per call; body battery reports max out between 28 and 59 days (sync chunks everything at 28); sleep is one night per call (`dailySleepSummariesByDate` 400s with `startDate/endDate` — params unknown).
- **A failed endpoint writes nothing.** Each component is fetched separately and `mergeGarminDays` leaves a failed component's keys OUT of the upsert, so a failed sleep fetch cannot null yesterday's sleep. Absent is null, never 0 (Garmin uses -1/-2 for unmeasured stress); out-of-range is rejected, not clamped. Body battery at wake is read from the intraday series by the response's own descriptor list, within 30 min of sleep end — never by column position.
- **Runs inside existing syncs, no new cron:** a separate block in `/api/cron/intervals-sync` (14 days) and in sync-on-open `/api/intervals/sync` (2 days, same claim). A 429 stores `cooldown_until` and every path respects it. The key expires (30-365 days; the athlete enters the date) — the weekly health audit and `qa-smoke` flag it from 14 days out. `scripts/backfill-garmin-wellness.ts --user <id> --from <date> [--commit]` imports history through the same sync code.
- **The coach reads it (step 6, 2026-10-24); readiness does NOT yet (step 7).** `formatGarminRecovery` (user-formatter) adds a "Garmin recovery signals" block: body battery at wake against HIS 28-day median/p10 (`getGarminBaselines`, ≥10 samples or "no baseline yet"), the HRV-status streak with Garmin's band, sleep stages vs his median deep sleep and Garmin's sleep need, overnight physiology, and all-day stress from the newest COMPLETE day (today's is still accumulating). It never repeats HRV / resting HR / sleep score, which the block above states from `daily_wellness`. Feed health: `lib/garmin/feed.ts` — `garminFeedGaps` → training-state `gaps[]` (not connected, expired, >36 h without success = unknown, never fine); `garminFeedProblem` → preflight `garmin_feed_problem` warn (expired, failing, key ≤14 days). Dashboard Recovery tile shows morning battery and HRV status as provenance.
- **Morning body battery = the day's PEAK (`body_battery_max`), not `body_battery_at_wake`.** Measured over the 731-day import: Garmin's "intraday" series is only 6 points a day, and before ~April 2026 those points carry no levels, so at-wake exists only recently and only when a point lands within 30 min of waking. The peak equals the at-wake value on 129/136 days (within 3 on 135) and exists every day. Readers take it from the newest COMPLETED night (a sleep record exists): before waking, today's peak is still the overnight low. Baselines use 90 days (a p10 of 28 values is the 3rd-lowest day). His distribution: p10 71 · median 88.
- **Step 7 (readiness rules) deliberately NOT done (2026-10-24).** Low morning battery (< p10) had 32 runs, 3 steady-run decoupling values, 4 easy-run EF values and 1 feedback entry in two years: no measurable link, and too few outcomes to place a threshold. The bottleneck is post-run feedback, not Garmin data. Table in `docs/garmin-personal-probe-findings.md`; revisit at ≥15 low-band runs with outcomes.

**intervals.icu credentials:** `runcoach.intervals_tokens.api_key` holds an AES-256-GCM blob, never plaintext — the key grants *write* access to the athlete's calendar and the service role bypasses RLS, so RLS is not what protects it. Encrypt/decrypt via `lib/intervals/crypto.ts`; the secret lives in `INTERVALS_TOKEN_KEY` (32 bytes, base64 or hex), outside the database.

**Chat history persistence:** `/coach/ask` posts `sessionId` along with messages. `/api/coach/chat/ask` resolves or creates a `runcoach.coach_chat_sessions` row (title seeded from the first user message) and persists each user + assistant turn into `runcoach.coach_chat_messages` with the supervisor envelope snapshot. The page has a History dropdown listing past sessions; click loads a session via `GET /api/coach/chat/sessions/[id]`. Soft-archive via `DELETE` (sets `status='archived'`).

**Streaming plan generation:** `/api/coach/plans/generate/stream` is an SSE variant of plan-gen. It emits `meta`, `token` (many), and `done` events. The page consumes the stream, shows a live preview window, and sets the final plan from the `done` payload. Final JSON parse + DB write + supervisor logging + Haiku critic all happen server-side after the stream completes.

**Tag-aware user-resource retrieval:** `runcoach.match_user_resources(...)` takes an optional `match_tags text[]` parameter; when supplied, only resources whose `methodology_tags` overlap with the query tags are returned (with a no-tag-filter fallback if zero match). `context-builder.ts` derives tags from query + current phase + workout type and threads them through `book-retriever.ts` → `user-resource-retriever.ts`.

**Supervisor (`lib/supervisor/`):** Three-piece watchdog on every AI call.
- **Pre-flight (`preflight.ts`)** — deterministic `validateContext(...)` that flags silent gaps (no planned-today workout, no recent runs, no book sources for plan generation, no active plan covering the review week). May inject a "SUPERVISOR NOTES" suffix into the system prompt so the model acknowledges gaps instead of confabulating.
- **Telemetry (`telemetry.ts`)** — `logCoachCall(...)` writes one row to `runcoach.coach_calls` per AI request (route, query_type, tokens, ceiling_hit, cache_used, latency, preflight warnings, plan_modified).
- **Post-flight critic (`critic.ts`)** — fire-and-forget call to `anthropic/claude-haiku-4-5` that grades the response on 5 axes (addresses_question / references_plan_day / references_runs_feedback / specific_pace_hr / no_contradiction), persists to `runcoach.coach_response_audits`. Auto-back-links the audit_id onto the coach_calls row.
- **Weekly health audit (`/api/cron/weekly-health-audit`)** — Sunday 22:30 UTC Vercel cron. Reads coverage / plan drift / RAG embedding completeness / AI quality stats from `coach_calls` + `coach_response_audits` and writes a markdown report into `coach_reports` with `report_type='system_health'`.

Wired into `chat/ask`, `review/analyze`, `plans/generate`. Each route returns a `supervisor: { callId, preflightOk, warnings }` envelope so the UI can surface the warnings inline.

**Strava Sync:** OAuth flow → token storage → manual sync button + automated Vercel Cron (daily at 15:00 and 21:40 UTC). For each new activity: stores summary row, fetches `/activities/{id}/laps` for lap rows, fetches `/activities/{id}/streams?keys=heartrate,time` and buckets the HR stream into the athlete's zones (`pct_z1..pct_z6` via `lib/utils/zones.ts`). Run type classified via `classifyRun` with `workoutName` + `profile` + `zonePercents`. Token refresh on expiry, auto-disconnect on permanent auth failure.

**Input Validation:** Zod schemas in `lib/validation/schemas.ts`. All API routes validate and bound numeric inputs.

**Security:** CSP headers in `next.config.ts`, RLS on all tables, service role key for API routes, `CRON_SECRET` for cron endpoints.

**RunCoach Design System:** Custom CSS variables (`--rc-ink`, `--rc-blue`, `--rc-surface`, etc.) in `globals.css`. Dark cards with radial gradients for AI content. Editorial typography with serif italics.

## Environment Variables

```bash
# Auth
NEXTAUTH_SECRET=<generated>
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# RunCoach Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tlnqkxwlrewbtufnqiwi.supabase.co   # same project as CalTrack; RunCoach client uses `runcoach` schema
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# CalTrack Supabase (separate project)
NEXT_PUBLIC_CALTRACK_SUPABASE_URL=https://tlnqkxwlrewbtufnqiwi.supabase.co
CALTRACK_SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI
OPENROUTER_API_KEY=<openrouter-key>
OPENAI_API_KEY=<for-embeddings>

# Strava
STRAVA_CLIENT_ID=<strava-app-id>
STRAVA_CLIENT_SECRET=<strava-app-secret>

# Fallback AI provider, used only when OpenRouter fails (see "Provider fallback")
NANOGPT_API_KEY=<nanogpt-api-key>

# intervals.icu (https://intervals.icu/settings -> Developer Settings)
INTERVALS_API_KEY=<intervals-api-key>
INTERVALS_ATHLETE_ID=<i-prefixed-athlete-id>
# Encrypts intervals_tokens.api_key at rest. 32 bytes: openssl rand -base64 32
INTERVALS_TOKEN_KEY=<32-byte-base64-or-hex-key>

# Cron
CRON_SECRET=<random-secret-for-vercel-cron>
```

## Vercel Cron Jobs

Defined in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/strava-sync", "schedule": "0 15 * * *" },
    { "path": "/api/cron/strava-sync", "schedule": "40 21 * * *" }
  ]
}
```

## Common Tasks

### Adding API Routes
1. Create `app/api/<path>/route.ts`
2. Add `export const runtime = 'nodejs'` at top for external API calls
3. Use `getAuthenticatedUser()` for auth
4. Validate input with Zod schemas from `lib/validation/schemas.ts`

### Updating CV Content
Edit `lib/cv-data.ts` - single source of truth for all CV sections.

### Modifying AI Coach Behavior
- System prompts: `lib/ai/coach-prompts.ts` and `lib/ai/grocky-prompts.ts`
- RAG context: `lib/rag/context-builder.ts` assembles the 3-layer context
- Token budgets per query type: `TOKEN_BUDGETS_PER_QUERY` in `lib/rag/types.ts`
- Prompt caching: pass `cacheSystemPrompt: true` to `callOpenRouter`
- Model selection: `lib/ai/model-registry.ts` (`MODEL_FOR`, `REASONING_FOR`); reasoning handling in `lib/ai/openrouter.ts` (`REASONING_POLICY`)

### Backfilling embeddings (one-shot admin)
The Supabase Edge Function `supabase/functions/backfill-embeddings` finds any `book_instructions` rows where `embedding IS NULL`, embeds via OpenAI `text-embedding-3-small` (1536d), and writes back. Requires the `OPENAI_API_KEY` Supabase secret. Invoke via POST with the anon key in `Authorization: Bearer`. Append `?dryRun=1` to count without writing.

### Working with Supabase
- RunCoach client: `lib/db/supabase.ts` (uses service role, bypasses RLS)
- CalTrack client: `lib/db/supabase-caltrack.ts` (separate project)
- Never use anon key in server-side code; service role is correct for API routes

## Important Notes

- **One Supabase project, two schemas** - `public` for CalTrack, `runcoach` for RunCoach. Don't mix clients: use `lib/db/supabase.ts` for RunCoach data, `lib/db/supabase-caltrack.ts` for CalTrack data.
- **`bun run build` before every commit** - TypeScript errors must be fixed.
- **Service role key fallback** - `lib/db/supabase.ts` falls back to anon key at build time (env vars unavailable during static analysis). This is intentional.
- **react-markdown** - Used for rendering AI coach analysis output (weekly review, reports).
- **Run feedback tracks by `run_id`** - Not by date. Multiple runs on same day are independent.
- **Coach reports auto-save** - Weekly analysis saves to `coach_reports` table via upsert on `(user_id, week_start)`.
