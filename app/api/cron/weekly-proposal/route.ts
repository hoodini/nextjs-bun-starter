/**
 * Saturday night: look at the week that just closed and decide whether the
 * plan should change.
 *
 * **Proposes, never applies.** A cron that silently rewrites the plan is a
 * change nobody can see that later looks like data — the failure this codebase
 * keeps meeting from other directions. The athlete accepts or dismisses.
 *
 * Saturday rather than Sunday because the training week here runs Sunday to
 * Saturday, so this lands after the week closes and BEFORE Sunday's session,
 * which is the only moment a proposal can actually change anything.
 *
 * A 'no_change' row is written when nothing crosses a threshold, and that is
 * the expected outcome most weeks. Without the row, a quiet week is
 * indistinguishable from a broken cron.
 *
 * Auth: Bearer CRON_SECRET.
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { COACH_STATIC_BLOCK } from '@/lib/ai/coach-prompts';
import { MODEL_FOR, REASONING_FOR } from '@/lib/ai/model-registry';
import { buildTrainingState, formatTrainingState } from '@/lib/coach/training-state';
import { evaluateTriggers, shouldPropose, describeNoChange } from '@/lib/coach/proposal-triggers';
import { getActiveMacroPlan, formatMacroPlan } from '@/lib/coach/macro-plan';
import { currentPhase } from '@/lib/coach/season-progress';
import { kpiBlockFor } from '@/lib/coach/season-status';
import { getActivePlan } from '@/lib/db/plans';
import { getAthleteProfile } from '@/lib/db/profile';
import { nowInUserTz, userDateStr } from '@/lib/utils/user-time';

/** Sunday of the week that just ENDED, YYYY-MM-DD in the athlete's timezone. */
function lastCompletedWeekStart(): string {
  const now = nowInUserTz();
  // Running Saturday evening, "this" week (Sun..Sat) is the one just closed.
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  const mm = String(sunday.getMonth() + 1).padStart(2, '0');
  const dd = String(sunday.getDate()).padStart(2, '0');
  return `${sunday.getFullYear()}-${mm}-${dd}`;
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekStart = lastCompletedWeekStart();
  const { data: profiles } = await supabase.from('athlete_profile').select('user_id');
  const results: { user_id: string; outcome: string }[] = [];

  for (const row of (profiles ?? []) as { user_id: string }[]) {
    try {
      results.push({ user_id: row.user_id, outcome: await proposeForUser(row.user_id, weekStart) });
    } catch (err) {
      console.error('weekly-proposal failed for', row.user_id, err);
      results.push({ user_id: row.user_id, outcome: 'error' });
    }
  }

  return NextResponse.json({ weekStart, results });
}

export async function proposeForUser(userId: string, weekStart: string): Promise<string> {
  // The unique index on (user_id, week_start) makes a re-run idempotent, but
  // checking first avoids a wasted LLM call on a manual re-trigger.
  const { data: existing } = await supabase
    .from('plan_proposals')
    .select('id,status')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (existing) return `already ran (${(existing as { status: string }).status})`;

  const profile = await getAthleteProfile(userId);
  const plan = await getActivePlan(userId);
  const [state, macro] = await Promise.all([
    buildTrainingState(userId, { profile, plan }),
    getActiveMacroPlan(userId),
  ]);

  // Which phase the athlete is in, and how deep into it — from the season's
  // own progress (phases are built when due, so the block plan's week number
  // no longer says which phase this is).
  const cp = macro ? currentPhase(macro, userDateStr()) : null;
  const phase = cp?.entry.phase ?? null;
  const weeksIntoPhase = cp?.weekOfPhase ?? null;
  // The phase KPIs the proposal should steer toward.
  const kpiBlock = macro ? await kpiBlockFor(userId) : '';

  const triggers = evaluateTriggers({ state, phase, weeksIntoPhase });

  const base = {
    user_id: userId,
    plan_id: plan?.id ?? null,
    macro_plan_id: macro?.id ?? null,
    week_start: weekStart,
    triggers,
    state_snapshot: state as unknown as Record<string, unknown>,
  };

  if (!shouldPropose(triggers)) {
    await supabase.from('plan_proposals').insert({
      ...base, status: 'no_change', proposal: null, summary: describeNoChange(triggers),
    });
    return 'no_change';
  }

  // Nothing to adjust without a plan — but the triggers still deserve a record
  // and a readable note, rather than a silent skip.
  if (!plan) {
    await supabase.from('plan_proposals').insert({
      ...base,
      // NOT 'pending': there is nothing to accept, and a pending row with no
      // plan used to surface on the next plan built weeks later.
      status: 'no_plan',
      proposal: null,
      summary:
        'Signals crossed their thresholds, but there is no active training plan to adjust:\n' +
        triggers.map((t) => `- ${t.detail}`).join('\n'),
    });
    return 'pending (no plan)';
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return 'skipped (no OPENROUTER_API_KEY)';

  const planWeeks = JSON.stringify((plan.plan_json?.weeks ?? []).slice(0, 6), null, 1);
  const triggerList = triggers.map((t) => `- [${t.code}] ${t.detail}`).join('\n');

  const systemPrompt = [
    formatTrainingState(state),
    macro ? formatMacroPlan(macro, null, phase?.phase_number ?? null) : '',
    kpiBlock,
    '## WHY YOU ARE BEING ASKED',
    'These rules fired on the week just completed:',
    triggerList,
    '',
    '## CURRENT PLAN (next weeks)',
    planWeeks,
    '',
    '## YOUR TASK',
    'Propose the SMALLEST change that addresses what fired. Adjust at most the next 3 weeks.',
    '',
    'Rules:',
    '- Change only what the triggers justify. An unrelated rewrite is worse than no change, because it spends the trust every future proposal depends on.',
    '- Keep the training days. Never schedule onto a day not already in use.',
    '- Preserve every field the current weeks carry, including total_elevation_gain_m, elevation_gain_m and indoor_alternative.',
    '- If a trigger reflects missing DATA rather than a training problem, say so and propose nothing for it.',
    '- Cut vert before km when load must come down.',
    '- If a PHASE KPI is behind, prefer the change that moves it — and name the KPI in the summary.',
    '',
    'Return ONLY raw JSON:',
    '{',
    '  "summary": "2-4 sentences the athlete reads first: what changed, and which number drove it.",',
    '  "adjusted_weeks": [ ...same shape as the plan weeks above... ]',
    '}',
  ].join('\n');

  const response = await callOpenRouter(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Propose the adjustment. Return ONLY the raw JSON object.' },
    ],
    { apiKey, model: MODEL_FOR.plan_generation, maxTokens: 8000, reasoningTokens: REASONING_FOR.plan_generation, cacheableSystemPrefix: COACH_STATIC_BLOCK },
  );

  if (response.error) {
    await supabase.from('plan_proposals').insert({
      ...base, status: 'pending', proposal: null,
      summary:
        `Triggers fired but the proposal could not be generated (${response.error}). Signals:\n` +
        triggers.map((t) => `- ${t.detail}`).join('\n'),
    });
    return 'pending (generation failed)';
  }

  let parsed: { summary?: string; adjusted_weeks?: unknown[] } = {};
  try {
    const f = response.content.indexOf('{');
    const l = response.content.lastIndexOf('}');
    parsed = JSON.parse(response.content.slice(f, l + 1));
  } catch {
    parsed = { summary: response.content.slice(0, 1500) };
  }

  await supabase.from('plan_proposals').insert({
    ...base,
    status: 'pending',
    proposal: parsed.adjusted_weeks ? { weeks: parsed.adjusted_weeks } : null,
    summary: parsed.summary ?? 'A change was proposed but came back without a summary.',
  });
  return 'pending';
}
