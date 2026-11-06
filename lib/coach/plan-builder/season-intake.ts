/**
 * What the athlete tells the season head coach, rendered for the prompt.
 *
 * Pure. The season form originally took only the race (name, date, distance,
 * climb, terrain), so the head coach designed without a target time or the
 * athlete's limits. These are the same intake fields a training block takes;
 * they are stored on the season (`macro_plans.intake`) and inherited by every
 * phase plan.
 */

import type { MacroPlan, SeasonIntake } from '@/lib/coach/macro-plan';
import { currentPhase } from '@/lib/coach/season-progress';
import { renderSeason } from './season-checks';

export interface SeasonIntakeInput extends SeasonIntake {
  /** Set by the route, never by the client: the season being revised, rendered. */
  previousSeasonText?: string;
}

/** The fields worth storing, empty ones dropped. */
export function intakeFromRequest(req: SeasonIntakeInput): SeasonIntake | null {
  const out: SeasonIntake = {};
  if (req.targetTime) out.targetTime = req.targetTime;
  if (req.recentRaceResult) out.recentRaceResult = req.recentRaceResult;
  if (req.currentWeeklyKm != null) out.currentWeeklyKm = req.currentWeeklyKm;
  if (req.addressesWhat) out.addressesWhat = req.addressesWhat;
  if (req.limitations) out.limitations = req.limitations;
  if (req.notes) out.notes = req.notes;
  if (req.changeRequest) out.changeRequest = req.changeRequest;
  return Object.keys(out).length ? out : null;
}

/** The prompt section. '' when the athlete said nothing beyond the race. */
export function formatSeasonIntake(req: SeasonIntakeInput): string {
  const lines: string[] = [];
  if (req.targetTime) lines.push(`- Target time: ${req.targetTime}`);
  if (req.recentRaceResult) lines.push(`- Recent race / time trial: ${req.recentRaceResult}`);
  if (req.currentWeeklyKm != null) lines.push(`- He reports his current weekly volume as ${req.currentWeeklyKm} km (the measured load in the athlete brief wins if they differ — say so)`);
  if (req.addressesWhat) lines.push(`- What the season should focus on: ${req.addressesWhat}`);
  if (req.limitations) lines.push(`- Limitations to respect: ${req.limitations}`);
  if (req.notes) lines.push(`- Anything else: ${req.notes}`);

  const parts: string[] = [];
  if (lines.length) {
    parts.push(
      "## WHAT THE ATHLETE TOLD YOU\n" + lines.join('\n') +
      '\n\nHonour every limitation as stated, even where it conflicts with a methodology default — name the conflict in "decisions". ' +
      'If the target time is not realistic from his measured load in this horizon, say so in the rationale and design for what is.',
    );
  }
  if (req.previousSeasonText) {
    parts.push(
      '## THIS IS A REVISION OF HIS CURRENT SEASON\n' + req.previousSeasonText +
      `\n\n### WHAT HE WANTS CHANGED\n${req.changeRequest || '(not stated — re-check the season against what he told you above)'}` +
      '\n\nChange what he asked for and whatever must follow from it. Keep everything else that was sound; do not redesign for the sake of it. ' +
      'Say in "decisions" what changed and why.',
    );
  }
  return parts.join('\n\n');
}

/**
 * The active season as the head coach sees it when asked to revise it: its
 * phases and briefs, where the athlete is in it today, and what he told the
 * coach last time.
 */
export function describeSeasonForRevision(macro: MacroPlan, today: string): string {
  const cp = currentPhase(macro, today);
  const where = !cp ? 'No phase is current.'
    : cp.weekOfPhase === null ? `Not started yet (starts ${macro.start_date ?? 'next Sunday'}).`
    : `He is in phase ${cp.entry.phase.phase_number} (${cp.entry.phase.name}), week ${cp.weekOfPhase} of ${cp.entry.weeks}.`;
  const prior = macro.intake ? formatSeasonIntake(macro.intake).replace("## WHAT THE ATHLETE TOLD YOU", '### What he told the coach last time') : '';
  return [
    `Season revision ${macro.revision}: ${macro.goal_name} · ${macro.horizon_weeks} weeks${macro.race_date ? ` · race ${macro.race_date}` : ''}`,
    where,
    `Rationale: ${macro.rationale ?? '—'}`,
    renderSeason({ goal_name: macro.goal_name, rationale: macro.rationale ?? '', phases: macro.phases, decisions: [] }),
    prior,
    'The revised season starts next Sunday. Weeks already trained are in the athlete brief as measured load — design from where he is now.',
  ].filter(Boolean).join('\n');
}
