/**
 * Staged plan builder API. See lib/coach/plan-builder/runner.ts.
 *
 *   POST { ...plan request }  → start a training-block build and run its first stage
 *   POST { kind: 'season', ...season request } → start a season build
 *   POST { kind: 'phase', macroPlanId, phaseNumber, extensionWeeks? } → build one season phase as a plan
 *   GET  ?kind=season         → the athlete's unfinished season build, if any
 *   POST { buildId }          → run the build's next stage
 *   GET  ?id=<buildId>        → a build's current state
 *   GET                       → the athlete's unfinished build, if any (resume)
 *
 * The client calls POST { buildId } until `stage` is done or failed. One
 * stage per request keeps every request well inside the function limit.
 */

export const runtime = 'nodejs';
// The head coach's stages (outline, review) run on a model whose thinking
// cannot be switched off. Stated explicitly rather than inherited.
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/db/supabase';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { macroPlanGenerationSchema, planGenerationSchema, validateInput } from '@/lib/validation/schemas';
import { getActiveMacroPlan } from '@/lib/coach/macro-plan';
import { getAthleteProfile } from '@/lib/db/profile';
import { parseTrainingDays } from '@/lib/coach/training-state';
import { advance, createBuild, getBuild, latestOpenBuild } from '@/lib/coach/plan-builder/runner';
import { toView } from '@/lib/coach/plan-builder/view';
import { describeSeasonForRevision } from '@/lib/coach/plan-builder/season-intake';
import { userDateStr } from '@/lib/utils/user-time';
import type { PlanBuildRow } from '@/lib/coach/plan-builder/types';

class ValidationError extends Error {}

/**
 * A season phase as a plan-builder request: the season supplies the race,
 * the phase supplies the length (or the extension), and the athlete's stated
 * days and runs per week come from the request or his profile.
 */
async function phaseBuildRequest(userId: string, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
  const macro = await getActiveMacroPlan(userId);
  const macroPlanId = String(fields.macroPlanId ?? '');
  const phaseNumber = Number(fields.phaseNumber);
  if (!macro || macro.id !== macroPlanId) throw new ValidationError('That season is not your active season.');
  const phase = macro.phases.find((p) => p.phase_number === phaseNumber);
  if (!phase) throw new ValidationError(`The season has no phase ${phaseNumber}.`);
  const extensionWeeks = fields.extensionWeeks ? Number(fields.extensionWeeks) : undefined;
  const profile = await getAthleteProfile(userId);
  const days = (fields.trainingDays as string[] | undefined) ?? parseTrainingDays(profile?.training_days) ?? undefined;
  const planType = (macro.race_elevation_gain_m ?? 0) > 0 ? 'Trail / Mountain'
    : (macro.race_distance_km ?? 0) >= 40 ? 'Marathon'
    : (macro.race_distance_km ?? 0) >= 15 ? 'Half Marathon' : 'Custom';
  return {
    planType,
    durationWeeks: extensionWeeks ?? phase.weeks,
    runsPerWeek: Number(fields.runsPerWeek ?? days?.length ?? 4),
    ...(days?.length ? { trainingDays: days } : {}),
    ...(fields.trainingDayNotes ? { trainingDayNotes: fields.trainingDayNotes } : {}),
    // The season's intake reaches every phase plan: same target, same limits.
    // A note typed for this phase goes first; the season's note follows.
    ...((fields.notes || macro.intake?.notes)
      ? { notes: [fields.notes, macro.intake?.notes].filter(Boolean).join('\n') }
      : {}),
    ...(macro.intake?.targetTime ? { targetTime: macro.intake.targetTime } : {}),
    ...(macro.intake?.recentRaceResult ? { recentRaceResult: macro.intake.recentRaceResult } : {}),
    ...(macro.intake?.limitations ? { limitations: macro.intake.limitations } : {}),
    ...(macro.intake?.addressesWhat ? { addressesWhat: `Season focus: ${macro.intake.addressesWhat}` } : {}),
    macroPlanId: macro.id,
    phaseNumber,
    ...(extensionWeeks ? { extensionWeeks } : {}),
    targetRace: macro.goal_name,
    ...(macro.race_date ? { raceDate: macro.race_date } : {}),
    ...(macro.race_distance_km ? { raceDistanceKm: Number(macro.race_distance_km) } : {}),
    ...(macro.race_elevation_gain_m ? { raceElevationGainM: Number(macro.race_elevation_gain_m) } : {}),
    ...(macro.terrain_access ? { terrainAccess: macro.terrain_access } : {}),
  };
}

async function view(row: PlanBuildRow, busy = false) {
  let plan = null;
  if (row.stage === 'done' && row.plan_id) {
    const { data } = await supabase.from('training_plans').select('*').eq('id', row.plan_id).maybeSingle();
    plan = data;
  }
  let season = null;
  if (row.stage === 'done' && row.macro_plan_id) {
    const { data } = await supabase.from('macro_plans').select('*').eq('id', row.macro_plan_id).maybeSingle();
    season = data;
  }
  return toView(row, busy, plan, season);
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth.authenticated || !auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  const kind = request.nextUrl.searchParams.get('kind') === 'season' ? 'season' : 'block';
  const row = id ? await getBuild(auth.userId, id) : await latestOpenBuild(auth.userId, kind);
  return NextResponse.json({ build: row ? await view(row) : null });
}

const advanceSchema = z.object({ buildId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth.authenticated || !auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    const next = advanceSchema.safeParse(body);
    if (next.success) {
      const { row, busy } = await advance(auth.userId, next.data.buildId);
      return NextResponse.json({ build: await view(row, busy) });
    }
    // { kind: 'season', ...season fields } starts a season build; anything
    // else is a training-block request.
    const { kind, ...fields } = body as { kind?: string } & Record<string, unknown>;
    const created = kind === 'phase'
      ? await (async () => {
          const req = await phaseBuildRequest(auth.userId!, fields);
          const v = validateInput(planGenerationSchema, req);
          if (!v.success) throw new ValidationError(v.error);
          return createBuild(auth.userId!, v.data);
        })()
      : kind === 'season'
      ? await (async () => {
          const v = validateInput(macroPlanGenerationSchema, fields);
          if (!v.success) throw new ValidationError(v.error);
          // A revision: the head coach sees the season being revised and what
          // the athlete wants changed. Rendered here, server-side, from the
          // ACTIVE season only — never text supplied by the client.
          let previousSeasonText: string | undefined;
          if (v.data.adjustsSeasonId) {
            const current = await getActiveMacroPlan(auth.userId!);
            if (!current || current.id !== v.data.adjustsSeasonId) throw new ValidationError('That season is not your active season.');
            previousSeasonText = describeSeasonForRevision(current, userDateStr());
          }
          return createBuild(auth.userId!, { ...v.data, ...(previousSeasonText ? { previousSeasonText } : {}) }, { kind: 'season' });
        })()
      : await (async () => {
          const v = validateInput(planGenerationSchema, fields);
          if (!v.success) throw new ValidationError(v.error);
          return createBuild(auth.userId!, v.data);
        })();
    const { row, busy } = await advance(auth.userId, created.id);
    return NextResponse.json({ build: await view(row, busy) });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error('plan build failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Plan build failed' }, { status: 500 });
  }
}
