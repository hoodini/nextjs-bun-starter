/**
 * Which weekly proposal, if any, the plan page should ask the athlete about.
 *
 * Pure so the rule is testable. A proposal is only actionable when it was
 * written FOR the plan that is active now, and only while it is the newest
 * weekly result — the next Saturday's run supersedes it.
 *
 * Found 2026-11-06: rows written while no plan was active (plan_id null,
 * status 'pending', nothing to apply) sat on top of a brand-new plan built
 * five weeks later, with a disabled "Apply" button and September's numbers.
 */

export interface ProposalLike {
  plan_id: string | null;
  status: string;
  created_at: string;
}

export function selectPendingProposal<T extends ProposalLike>(rows: T[], activePlanId: string | null): T | null {
  if (!activePlanId || rows.length === 0) return null;
  const newest = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (newest.status !== 'pending' || newest.plan_id !== activePlanId) return null;
  return newest;
}

/** The newest weekly result, if it was a quiet one — shown as a single line. */
export function selectLastQuiet<T extends ProposalLike>(rows: T[], activePlanId: string | null): T | null {
  if (!activePlanId || rows.length === 0) return null;
  const newest = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (newest.status !== 'no_change' || newest.plan_id !== activePlanId) return null;
  return newest;
}
