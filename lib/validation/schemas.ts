/**
 * Input validation schemas using Zod
 * All API input should be validated before processing
 */

import { z } from 'zod';

// Common validators
const safeString = z.string().max(10000).trim();
const safeText = z.string().max(50000).trim();
const positiveInt = z.number().int().positive();
const rating = z.number().int().min(1).max(10);

/**
 * Coerce "" (and null) → undefined before running an optional schema.
 * Without this, an optional enum like `feeling` will reject the empty
 * string that React forms naturally send when a pill is not picked,
 * and the API silently 400s. Use this for any optional enum that comes
 * from a form. (run_feedback was already fixed on the client; this is
 * defence-in-depth.)
 */
const emptyToUndef = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema);

// Run data validation
export const runSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  distance_km: z.number().positive().max(1000).optional(),
  duration_min: z.number().positive().max(1440).optional(),
  duration_sec: positiveInt.max(86400).optional(),
  avg_hr: positiveInt.max(300).optional(),
  max_hr: positiveInt.max(300).optional(),
  avg_pace_min_km: z.number().positive().max(60).optional(),
  avg_pace_str: safeString.max(20).optional(),
  calories: positiveInt.max(100000).optional(),
  run_type: safeString.max(100).optional(),
  workout_name: safeString.max(200).optional(),
  coach_notes: safeText.optional(),
  // Enum was a fiction: production DB has `garmin`, `garmin+tp`, `strava_sync`,
  // `fit_upload`, `tp_only` — none of which matched the old enum's
  // `manual|strava|fit_file`. Anyone posting to /api/coach/runs with a
  // real value would have been rejected. Switched to a bounded free string.
  data_source: safeString.max(40).optional(),
});

// Training plan validation. The intake fields are optional but recommended
// for plan-gen quality — they carry race date, target time, recent race,
// current volume, what-to-address, and limitations. The server enriches
// further from runs/plans tables before building the prompt.
/**
 * Days of the week, canonical spelling. Used by plan generation so a plan can
 * be built around the days the athlete actually runs rather than around
 * whatever `athlete_profile.training_days` happened to say when it was last
 * edited — a field that went stale for months and silently capped the weekly
 * scorecard's judgeable coverage.
 */
export const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export const planGenerationSchema = z.object({
  planType: z.enum([
    'Half Marathon', 'Marathon', '10K', '5K', 'Base Building', 'Custom',
    // Distance alone stopped describing the goal once a 1300 m race entered
    // the picture. Kept as a type for phase shaping, but the elevation fields
    // below are what actually drive the plan — a flat 21K and a 21K with
    // 1300 m of climb are different events sharing a distance.
    'Trail / Mountain', '5K Speed', 'Maintenance',
  ]),
  durationWeeks: z.number().int().min(1).max(52),
  runsPerWeek: z.number().int().min(1).max(14),
  /**
   * Which days the plan may schedule on. Omitted means "fall back to the
   * profile" — an empty array is rejected rather than treated as "any day",
   * because a plan free to use all seven days is a different request from a
   * plan whose days were simply not stated.
   */
  trainingDays: z.array(z.enum(WEEKDAYS)).min(1).max(7).optional(),
  /** Free-text note on which day carries which session, e.g. "Monday quality". */
  trainingDayNotes: safeString.max(300).optional(),

  /**
   * The season this block serves. When present the generator is told which
   * phase it is writing for, its targets and its exit criteria, so a block
   * knows what it is FOR rather than restating a generic build.
   */
  macroPlanId: z.string().uuid().optional(),
  /** @deprecated assumed 12-week blocks; use phaseNumber. */
  blockNumber: z.number().int().min(1).max(20).optional(),
  /**
   * The season phase this plan builds — one plan per phase, built when the
   * phase is due. With macroPlanId, the phase's brief (goal, KPIs, ranges,
   * must-haves, don'ts) becomes the plan builder's contract.
   */
  phaseNumber: z.number().int().min(1).max(20).optional(),
  /** Build a 2-3 week EXTENSION of the phase instead of the phase itself. */
  extensionWeeks: z.number().int().min(1).max(4).optional(),

  // ---- Race profile. What the plan must actually prepare the athlete FOR. ----
  /**
   * Race distance in km. Distinct from `planType`: the type shapes the phase
   * split, this is the number the plan's long runs have to build toward.
   */
  raceDistanceKm: z.number().positive().max(500).optional(),
  /**
   * Total climb of the target race, metres. The single most decision-changing
   * field in this form when it is present — with distance it yields the race's
   * gradient, which the plan is then built against and which the athlete's own
   * measured history can be compared to.
   */
  raceElevationGainM: z.number().int().min(0).max(30000).optional(),
  /**
   * What terrain the athlete can actually train on. A plan prescribing 60 m/km
   * repeats to someone with no hill inside an hour's drive is a plan that will
   * not be run.
   */
  terrainAccess: safeText.max(600).optional(),
  targetRace: safeString.max(200).optional(),
  notes: safeText.max(2000).optional(),
  // Rich intake (form-driven)
  raceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  targetTime: safeString.max(20).optional(),
  recentRaceResult: safeString.max(300).optional(),
  currentWeeklyKm: z.number().positive().max(500).optional(),
  addressesWhat: safeText.max(1000).optional(),
  limitations: safeText.max(1000).optional(),
});

/**
 * Season-level plan request.
 *
 * `horizonWeeks` spans a single block up to two years. The athlete has said he
 * will ask for 11 months, then 6, then 4 — so nothing here may assume a
 * particular length, and the phase model scales by proportion rather than by
 * special case (see suggestedPhaseCount).
 */
export const macroPlanGenerationSchema = z.object({
  goalName: safeString.min(1).max(200),
  raceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horizonWeeks: z.number().int().min(4).max(104),
  runsPerWeek: z.number().int().min(1).max(14).optional(),
  raceDistanceKm: z.number().positive().max(500).optional(),
  raceElevationGainM: z.number().int().min(0).max(30000).optional(),
  terrainAccess: safeText.max(600).optional(),
  // Intake for the head coach — the same fields a training block takes, so a
  // season knows the target time and the limits it must respect. Stored on the
  // season and inherited by every phase plan built from it.
  targetTime: safeString.max(20).optional(),
  recentRaceResult: safeString.max(300).optional(),
  currentWeeklyKm: z.number().positive().max(500).optional(),
  /** What the season should focus on / fix (e.g. "climbing, descending legs"). */
  addressesWhat: safeText.max(1000).optional(),
  limitations: safeText.max(1000).optional(),
  notes: safeText.max(2000).optional(),
  /** Revising the active season: its id and what the athlete wants changed. */
  adjustsSeasonId: z.string().uuid().optional(),
  changeRequest: safeText.max(2000).optional(),
});

export const planSaveSchema = z.object({
  plan_type: safeString.max(100),
  plan_json: z.record(z.string(), z.unknown()),
  duration_weeks: z.number().int().min(1).max(52),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Plan adjustment validation
export const planAdjustmentSchema = z.object({
  adjustmentType: emptyToUndef(z.enum(['weekly_review', 'user_request', 'injury', 'performance']).optional()),
  userRequest: safeText.max(10000).optional(), // Increased to handle full conversation context
  weeklyFeedback: z.object({
    overallFeeling: rating.optional(),
    sleepQuality: rating.optional(),
    stressLevel: rating.optional(),
    injuryNotes: safeText.max(1000).optional(),
  }).optional(),
});

// Chat message validation
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: safeText.max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(50).optional(),
  reviewPlan: z.boolean().optional(),
  sessionId: z.string().uuid().nullable().optional(),
});

// Feedback validation. The optional enums are wrapped in emptyToUndef so
// the API gracefully accepts the empty-string payloads React forms emit
// for unselected pills — the client also strips them, but defending here
// stops future code paths from regressing into silent 400s.
export const runFeedbackSchema = z.object({
  run_id: emptyToUndef(z.string().uuid().optional()),
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rating: rating.optional(),
  effort_level: rating.optional(),
  feeling: emptyToUndef(z.enum(['great', 'good', 'okay', 'tired', 'exhausted']).optional()),
  comment: emptyToUndef(safeText.max(2000).optional()),
  followed_plan: emptyToUndef(z.enum(['yes', 'no', 'modified']).optional()),
  pre_run_feeling: emptyToUndef(z.enum(['fresh', 'good', 'tired', 'sore_legs', 'stressed']).optional()),
});

// Weekly summary validation
export const weeklySummarySchema = z.object({
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  overall_feeling: rating.optional(),
  sleep_quality: rating.optional(),
  stress_level: rating.optional(),
  injury_notes: safeText.max(2000).optional(),
  achievements: safeText.max(2000).optional(),
  ai_analysis: safeText.optional(),
});

// Profile validation
export const profileSchema = z.object({
  name: safeString.max(100).optional(),
  age: z.number().int().min(10).max(120).optional(),
  weight_kg: z.number().positive().max(500).optional(),
  resting_hr: positiveInt.max(200).optional(),
  max_hr: positiveInt.max(250).optional(),
  lactate_threshold_hr: positiveInt.max(250).optional(),
  current_goal: safeString.max(500).optional(),
  long_term_goal: safeString.max(500).optional(),
  active_goal_focus: safeString.max(500).optional(),
  training_days: safeString.max(100).optional(),
  injury_history: safeText.max(2000).optional(),
  hr_zone_z1: safeString.max(20).optional(),
  hr_zone_z2: safeString.max(20).optional(),
  hr_zone_z3: safeString.max(20).optional(),
  hr_zone_z4: safeString.max(20).optional(),
  hr_zone_z5: safeString.max(20).optional(),
  hr_zone_z6: safeString.max(20).optional(),
});

// Strava sync validation
export const stravaSyncSchema = z.object({
  daysBack: z.number().int().min(1).max(365).optional(),
});

// intervals.icu sync validation.
//
// daysBack is capped well below a full year on purpose: this endpoint is the
// steady-state sync, not the migration. Historical catch-up belongs to
// scripts/backfill-intervals.ts, which is dry-run-first and reports what it
// would change. A 400-day pull through here would perform the same
// reconciliation unattended, with no report.
//
// `ifStaleMinutes` turns the call into an AUTOMATIC sync: the server runs it
// only if `last_sync_at` is older than that, and reports `skipped` otherwise.
// Sync-on-open passes it; the "Sync Now" button deliberately does not, because
// a button that silently declines to do the thing it names is worse than a
// redundant API call.
export const intervalsSyncSchema = z.object({
  daysBack: z.number().int().min(1).max(30).optional(),
  ifStaleMinutes: z.number().int().min(1).max(1440).optional(),
});

// Pushing a plan week to the watch. `preview` defaults to TRUE so a caller
// that forgets the flag gets a dry run rather than writing to a real training
// calendar.
export const pushWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  preview: z.boolean().optional().default(true),
});

// intervals.icu connection. Bounded tightly because these land in a token row:
// the key is an opaque ~24-char string and the athlete id looks like "i665723".
//
// The athlete id NORMALISES rather than merely validating. A bare "665723"
// passes any regex that allows it, then fails at the API with a 403 that reads
// as an auth problem — so accepting the form means having to fix it, not just
// permit it. Blank is allowed too: "0" resolves server-side to whoever the key
// belongs to, which makes the one genuinely error-prone field skippable.
export const intervalsConnectSchema = z.object({
  apiKey: z.string().trim().min(8).max(256),
  athleteId: z
    .string()
    .trim()
    .max(32)
    .regex(/^(i?\d+)?$/, 'Athlete ID looks like "i665723" — or leave it blank to use the key\'s own athlete')
    .transform((v) => (v === '' ? '0' : v.startsWith('i') ? v : `i${v}`))
    .optional(),
});

// Garmin Personal API key. Garmin offers 30/90/180/365-day keys and never
// reports the expiry back, so the athlete states it; the app warns from 14 days out.
export const garminConnectSchema = z.object({
  apiKey: z.string().trim().min(20).max(1024),
  keyExpiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry must be a date (YYYY-MM-DD)'),
});

// One window of a Garmin history import. 28 days is the body battery endpoint's
// measured limit, and keeps each request well inside the function timeout.
export const garminBackfillSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Review analysis validation
export const reviewAnalysisSchema = z.object({
  overallFeeling: rating.optional(),
  sleepQuality: rating.optional(),
  stressLevel: rating.optional(),
  injuryNotes: safeText.max(2000).optional(),
  achievements: safeText.max(2000).optional(),
});

// Helper function to validate and return typed result or error
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessages = result.error.issues
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
  return { success: false, error: `Validation error: ${errorMessages}` };
}
