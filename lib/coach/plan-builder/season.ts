/**
 * The staged builder for a SEASON (macro plan).
 *
 *   created ─prepare─▶ prepared ─design─▶ outlined ─check─▶ checked
 *     ─review─▶ (coherence_fix ─▶ checked)* ─▶ reviewed ─save─▶ done
 *
 * Same machine as a training block (./runner.ts) minus the phase writers —
 * a season IS an outline, phases with ranges and exit criteria, so there is
 * nothing bulky to write. What the single-call route lacked was everything
 * around the model call: it never searched the books, never measured where
 * the athlete was beyond the training state, and saved whatever came back if
 * it parsed. Steps 1-3 are the block builder's `prepare`, unchanged.
 */

import { saveMacroPlan, type MacroPhase } from '@/lib/coach/macro-plan';
import { buildMacroPlanPrompt } from '@/lib/ai/macro-plan-prompt';
import { MODEL_FOR } from '@/lib/ai/model-registry';
import { extractJson } from '@/lib/coach/plan-output';
import { supabase } from '@/lib/db/supabase';
import { ask, Meter } from './llm';
import { formatResearch, prepare } from './prepare';
import { formatSeasonIntake, intakeFromRequest, type SeasonIntakeInput } from './season-intake';
import { checkSeason, normalizeSeason, renderSeason, type SeasonCheckContext } from './season-checks';
import type {
  BuildReport, BuildRequest, BuildStage, CheckReport, CoherenceIssue, CoherenceReview, OutlinePhase,
  PlanBuildRow, PreparedStage, SeasonDraft, SeasonRequest, Violation,
} from './types';

const MAX_REVIEW_ROUNDS = 2;
const MAX_REPAIR_ROUNDS = 2;
const MAX_ATTEMPTS = 2;

/**
 * The season request in the shape `prepare` reads. planType only steers the
 * periodization search query and the long-run need; the goal name is the
 * target race.
 */
export function seasonAsBlockRequest(req: SeasonRequest): BuildRequest {
  const planType = (req.raceElevationGainM ?? 0) > 0 ? 'Trail / Mountain'
    : (req.raceDistanceKm ?? 0) >= 40 ? 'Marathon'
    : (req.raceDistanceKm ?? 0) >= 15 ? 'Half Marathon' : 'Custom';
  return {
    planType, durationWeeks: req.horizonWeeks, runsPerWeek: req.runsPerWeek ?? 4,
    targetRace: req.goalName, raceDate: req.raceDate, raceDistanceKm: req.raceDistanceKm,
    raceElevationGainM: req.raceElevationGainM, terrainAccess: req.terrainAccess,
    // The intake reaches the race brief (target time) and the research intake.
    targetTime: req.targetTime, recentRaceResult: req.recentRaceResult,
    currentWeeklyKm: req.currentWeeklyKm, addressesWhat: req.addressesWhat,
    limitations: req.limitations, notes: req.notes,
  } as BuildRequest;
}

function checkContext(req: SeasonRequest, prep: PreparedStage): SeasonCheckContext {
  return {
    horizonWeeks: req.horizonWeeks,
    weeksToRace: prep.race.weeksToRace,
    hasElevation: prep.race.hasElevation,
    raceElevationGainM: prep.race.elevationGainM,
    vertPerKm: prep.race.vertPerKm,
    raceDistanceKm: prep.race.distanceKm,
    athlete: prep.athlete,
  };
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

/**
 * Everything the head coach needs to design (or re-design) the season. Byte-
 * stable within a build, so it is sent as the cached prefix and every fix
 * round reads it at ~10% of the price.
 */
function seasonContext(req: SeasonRequest, prep: PreparedStage): string {
  const raceInHorizon = prep.race.weeksToRace !== null && prep.race.weeksToRace <= req.horizonWeeks + 1;
  return `${prep.research.coachContext}

${prep.athlete.text}

${prep.race.text}

${formatSeasonIntake(req as SeasonIntakeInput)}

${formatResearch(prep.research)}

${buildMacroPlanPrompt({
    goalName: req.goalName,
    raceDate: req.raceDate,
    horizonWeeks: req.horizonWeeks,
    trainingDays: prep.trainingDaysText ?? undefined,
    runsPerWeek: req.runsPerWeek,
    // Race demand and training state are already above, in the race and
    // athlete briefs — passing them again would print them twice.
    raceDemand: undefined,
    state: null,
    exemplarsText: prep.research.exemplarsText,
  })}

### ALSO REQUIRED
- Phase 1 starts from the MEASURED load in the athlete brief, not from the goal.
- ${raceInHorizon
    ? `The race is inside this season: the phases must sum to exactly ${prep.race.weeksToRace} weeks, ending on race week, and the final phase is the taper.`
    : `The phases must sum to exactly ${req.horizonWeeks} weeks.${prep.race.durationNote ? ` ${prep.race.durationNote}` : ''}`}
${prep.race.hasElevation && prep.race.elevationGainM && raceInHorizon ? `- The peak phase's weekly climbing range must reach at least the race's own ${prep.race.elevationGainM} m.\n` : ''}- Add a top-level "decisions" array: poles (yes or no, and the phase they enter), fuelling practice, altitude, and anything else the race brief raises. Unstated is not decided.
- Be brief — reason fully, write tersely. Rationale ≤ 120 words; ≤ 4 exit criteria per phase, each a single measurable line.

### EACH PHASE ALSO CARRIES YOUR BRIEF — THE CONTRACT ITS COACH WILL BUILD FROM
Every phase is later built as its own training plan, by a coach who gets only
your brief, the athlete's data at that time, and the research. Write the brief
for that coach. Add these fields to every phase:
- "goal": one sentence — what this phase is for.
- "why_this_length": one sentence.
- "must_haves": 2-4 items that MUST be in the phase's plan.
- "avoid": 2-4 don'ts.
- "watch_for": 2-3 warning signs that mean ease off or extend (e.g. first-step heel pain, readiness REST twice in a week).
- "handoff": what this phase hands to the next one.
- "kpis": 2-4 MEASURABLE targets. The app evaluates them from his data every week — the weekly reviewer steers toward the ones behind, and they decide when the phase is done. Use ONLY these metrics:
  - "weekly_km", "weekly_vert_m" — with "consecutive_weeks" (complete weeks in a row). Weekly vert is what his watch LOGS; indoor incline often records 0.
  - "long_run_km", "session_vert_m" — best single run in the phase.
  - "adherence_pct" — % of runs on his stated days.
  - "decoupling_pctile" — median decoupling as a percentile of HIS OWN history (use "lte"; only steady runs produce it — hiked sessions do not).
  - "form" (CTL − ATL, latest), "ctl" (latest).
  Every KPI must be reachable INSIDE the phase's own weekly ranges, session cap and length — a KPI the phase cannot reach is a trap. The exit criteria restate the KPIs in words.
  Example: { "id": "vert_700x3", "label": "3 weeks in a row at 700+ m logged climbing", "metric": "weekly_vert_m", "comparator": "gte", "target": 700, "consecutive_weeks": 3 }
A taper phase needs only a goal and "form" as its KPI.`;
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

type StageResult = Partial<PlanBuildRow>;

function parseSeason(text: string, goalName: string): { season: SeasonDraft | null; problem: string | null } {
  try {
    const n = normalizeSeason(extractJson(text), goalName);
    return n.season ? { season: n.season, problem: null } : { season: null, problem: n.fatal.join('; ') };
  } catch (e) {
    return { season: null, problem: `unreadable season (${e instanceof Error ? e.message : 'parse error'})` };
  }
}

/** Rewrite the whole season against a list of problems. Small output — a season is an outline. */
async function redesign(row: PlanBuildRow, season: SeasonDraft, problems: string[], meter: Meter): Promise<SeasonDraft | null> {
  const req = row.request as unknown as SeasonRequest;
  const r = await ask(row.user_id, 'plan_outline',
    `## YOUR CURRENT SEASON\n${JSON.stringify(season)}\n\n## PROBLEMS FOUND\n${problems.map((p) => `- ${p}`).join('\n')}`,
    'Rewrite the season fixing EVERY problem listed, changing as little else as possible. Keep the same JSON shape, including "decisions". Return only the JSON.',
    8_000, meter, seasonContext(req, row.prepared!));
  if (r.error || r.finishReason === 'length') return null;
  return parseSeason(r.content, req.goalName).season;
}

/** Rule errors → redesign → recheck, up to MAX_REPAIR_ROUNDS. */
async function checkAndRepair(row: PlanBuildRow, season: SeasonDraft, prior: CheckReport | null, meter: Meter) {
  const req = row.request as unknown as SeasonRequest;
  const ctx = checkContext(req, row.prepared!);
  const repairs = [...(prior?.repairs ?? [])];
  let violations = checkSeason(season, ctx);
  for (let round = 1; round <= MAX_REPAIR_ROUNDS; round++) {
    const errors = violations.filter((v) => v.severity === 'error');
    if (errors.length === 0) break;
    const next = await redesign(row, season, errors.map((e) => `${e.week ? `Phase ${e.week}: ` : ''}${e.message}`), meter);
    if (!next) break;
    const after = checkSeason(next, ctx);
    repairs.push({
      round: repairs.length + 1,
      weeks: [...new Set(errors.map((e) => e.week).filter((w): w is number => w !== null))],
      errorsBefore: errors.length,
      errorsAfter: after.filter((v) => v.severity === 'error').length,
    });
    season = next;
    violations = after;
  }
  const report: CheckReport = {
    violations,
    errors: violations.filter((v) => v.severity === 'error').length,
    warnings: violations.filter((v) => v.severity === 'warn').length,
    repairs,
  };
  return { season, report };
}

export function reviewPrompt(req: SeasonRequest, prep: PreparedStage, season: SeasonDraft, remaining: Violation[]): { system: string; user: string } {
  const system = `${prep.athlete.text}

${prep.race.text}

${formatSeasonIntake(req as SeasonIntakeInput)}

## THE SEASON (designed by the head coach)
Goal: ${season.goal_name} · ${req.horizonWeeks}-week horizon${req.raceDate ? ` · race ${req.raceDate}` : ''}
Rationale: ${season.rationale}
Decisions: ${season.decisions.join(' | ') || 'none stated'}
${renderSeason(season)}

## ALREADY FOUND BY MEASUREMENT — do not repeat these
${remaining.map((v) => `- ${v.week ? `P${v.week}: ` : ''}${v.message}`).join('\n') || '- nothing'}

## YOUR TASK: DOES THIS SEASON FIT?
Read it as one season and answer:
1. **Phase to phase** — does each phase pick up where the last ends (volume, climbing, long run, intensity), or reset or leap?
2. **Separate tracks** — do volume, climbing and descent each progress on their own track, with climbing cut before km when load must drop, and descent treated as its own stressor?
3. **Exit criteria** — can each phase's criteria actually be reached inside its length and weekly ranges, and measured with the app's data? A criterion needing more than the phase's range allows is a trap.
4. **Against the athlete and the race** — does phase 1 start from his measured load? Does the peak prepare him for THIS race's gradient and climb? Are his plantar-fasciitis history, poles, fuelling and altitude handled? Does the season end correctly (race week and taper, or a clean hand-over)?
5. **The briefs** — could a coach who sees ONLY a phase's brief build the right plan from it? Do the KPIs measure the phase's goal (not something easier to count), and does each phase's hand-over match what the next phase assumes?
6. **What he told you** — does the season honour every stated limitation, give an honest answer on the target time, and (on a revision) make the change he asked for?

Severity: "must_fix" ONLY for problems that would hurt him or leave him unprepared — name the phases and say exactly what to change. Everything else is a "note". At most 6 issues. If it fits, say so.

Return ONLY this JSON:
{ "verdict": "coherent" | "needs_changes", "summary": "2-3 sentences",
  "issues": [ { "severity": "must_fix" | "note", "phases": [2, 3], "problem": "…", "fix": "…" } ] }`;
  return { system, user: 'Review the season. Return only the JSON.' };
}

export async function runSeasonStage(row: PlanBuildRow): Promise<StageResult> {
  const t = Date.now();
  const meter = new Meter();
  const timings = { ...row.timings };
  const attempts = { ...(row.attempts ?? {}) };
  const note = (k: string, extra: { tokens?: number; thinking?: number } = {}) => { timings[k] = { ms: Date.now() - t, ...extra, ...meter.summary }; };
  const req = row.request as unknown as SeasonRequest;

  switch (row.stage) {
    case 'created': {
      const prepared = await prepare(row.user_id, seasonAsBlockRequest(req));
      note('prepare');
      return { stage: 'prepared', prepared, timings };
    }

    case 'prepared': {
      const r = await ask(row.user_id, 'plan_outline', 'Design the season now.', 'Design my season. Return only the JSON.',
        8_000, meter, seasonContext(req, row.prepared!));
      note('design', { tokens: r.completionTokens ?? undefined, thinking: r.reasoningTokensUsed ?? undefined });
      const problem = r.error ?? (r.finishReason === 'length' ? 'the season was cut off at the length limit' : null);
      const parsed = problem ? { season: null, problem } : parseSeason(r.content, req.goalName);
      if (parsed.season) return { stage: 'outlined', season: parsed.season, timings, error: null };
      attempts.design = (attempts.design ?? 0) + 1;
      if (attempts.design >= MAX_ATTEMPTS) return { stage: 'failed', error: `Season design failed twice: ${parsed.problem}`, attempts, timings };
      return { error: `Season design attempt ${attempts.design} unusable (${parsed.problem}); retrying.`, attempts, timings };
    }

    case 'outlined': {
      const { season, report } = await checkAndRepair(row, row.season!, null, meter);
      note('check');
      return { stage: 'checked', season, checks: report, timings };
    }

    case 'checked': {
      const round = row.review_rounds + 1;
      const remaining = (row.checks?.violations ?? []).filter((v) => v.severity === 'error');
      const { system, user } = reviewPrompt(req, row.prepared!, row.season!, remaining);
      const r = await ask(row.user_id, 'plan_review', system, user, 4_000, meter);
      note(`review_${round}`, { tokens: r.completionTokens ?? undefined, thinking: r.reasoningTokensUsed ?? undefined });
      let issues: CoherenceIssue[] = [];
      let summary = '';
      let verdict: CoherenceReview['verdict'] = 'coherent';
      if (!r.error && r.finishReason !== 'length') {
        try {
          const j = extractJson(r.content) as { verdict?: string; summary?: string; issues?: { severity?: string; phases?: number[]; problem?: string; fix?: string }[] };
          summary = j.summary ?? '';
          verdict = j.verdict === 'needs_changes' ? 'needs_changes' : 'coherent';
          issues = (j.issues ?? []).slice(0, 6).map((i) => ({
            severity: (i.severity === 'must_fix' ? 'must_fix' : 'note') as CoherenceIssue['severity'],
            weeks: (i.phases ?? []).filter((n) => Number.isInteger(n) && n >= 1 && n <= row.season!.phases.length),
            problem: String(i.problem ?? ''), fix: String(i.fix ?? ''), source: 'coach' as const,
          })).filter((i) => i.problem);
        } catch { summary = 'The head coach review could not be read; measured checks still applied.'; }
      } else {
        summary = `Head coach review unavailable (${r.error ?? 'cut off'}); measured checks still applied.`;
      }
      const mustFix = issues.filter((i) => i.severity === 'must_fix');
      const review: CoherenceReview = { round, verdict: mustFix.length ? 'needs_changes' : verdict, summary, issues };
      const next: BuildStage = mustFix.length > 0 && round <= MAX_REVIEW_ROUNDS ? 'coherence_fix' : 'reviewed';
      return { stage: next, reviews: [...row.reviews, review], review_rounds: round, timings };
    }

    case 'coherence_fix': {
      const last = row.reviews[row.reviews.length - 1];
      const mustFix = last.issues.filter((i) => i.severity === 'must_fix');
      let season = row.season!;
      const redesigned = await redesign(row, season, mustFix.map((i) =>
        `${i.weeks.length ? `Phase ${i.weeks.join(', ')}: ` : ''}${i.problem} FIX: ${i.fix}`), meter);
      if (redesigned) season = redesigned;
      const checked = await checkAndRepair(row, season, row.checks, meter);
      note(`fix_${row.review_rounds}`);
      const reviews = row.reviews.map((r, i) => (i === row.reviews.length - 1 ? { ...r, fixApplied: true } : r));
      const next: BuildStage = row.review_rounds < MAX_REVIEW_ROUNDS ? 'checked' : 'reviewed';
      return { stage: next, season: checked.season, checks: checked.report, reviews, timings };
    }

    case 'reviewed': {
      const report = seasonReport(row);
      if (row.dry_run) { note('save'); return { stage: 'done', timings }; }
      const saved = await saveMacroPlan(row.user_id, {
        goal_name: row.season!.goal_name,
        race_date: req.raceDate ?? null,
        race_distance_km: req.raceDistanceKm ?? null,
        race_elevation_gain_m: req.raceElevationGainM ?? null,
        terrain_access: req.terrainAccess ?? null,
        horizon_weeks: req.horizonWeeks,
        phases: row.season!.phases,
        rationale: row.season!.rationale,
        intake: intakeFromRequest(req as SeasonIntakeInput),
      });
      if (!saved) throw new Error('saving the season failed; the previous season is still active');
      await supabase.from('macro_plans').update({ build_report: report }).eq('id', saved.id);
      note('save');
      return { stage: 'done', macro_plan_id: saved.id, timings };
    }

    default:
      return {};
  }
}

/** Phases with their week ranges, in the report's shape. */
function asOutlinePhases(phases: MacroPhase[]): OutlinePhase[] {
  let start = 1;
  return phases.map((p) => {
    const o: OutlinePhase = {
      name: p.name, start_week: start, end_week: start + p.weeks - 1,
      purpose: p.capability || p.focus, key_sessions: p.key_sessions, strength_focus: '', exit_criteria: p.exit_criteria,
    };
    start += p.weeks;
    return o;
  });
}

export function seasonReport(row: PlanBuildRow): BuildReport {
  const addressed = row.reviews.filter((r) => r.fixApplied)
    .flatMap((r) => r.issues.filter((i) => i.severity === 'must_fix'));
  const last = row.reviews[row.reviews.length - 1];
  const open = last && !last.fixApplied ? last.issues : (last?.issues ?? []).filter((i) => i.severity === 'note');
  return {
    build_id: row.id,
    rationale: row.season?.rationale ?? '',
    phases: asOutlinePhases(row.season?.phases ?? []),
    decisions: row.season?.decisions ?? [],
    athlete_notes: [row.prepared?.athlete.dayMismatch, row.prepared?.race.durationNote].filter((x): x is string => !!x),
    checks: {
      errors: row.checks?.errors ?? 0,
      warnings: row.checks?.warnings ?? 0,
      repaired_weeks: [...new Set((row.checks?.repairs ?? []).flatMap((r) => r.weeks))].sort((a, b) => a - b),
      remaining: (row.checks?.violations ?? []).slice(0, 40),
    },
    coherence: { rounds: row.review_rounds, verdict: last?.verdict ?? 'not reviewed', summary: last?.summary ?? '', addressed, open },
    models: { outline: MODEL_FOR.plan_outline, writer: '—', review: MODEL_FOR.plan_review },
    seconds: Math.round(Object.values(row.timings).reduce((a, x) => a + x.ms, 0) / 1000),
  };
}
