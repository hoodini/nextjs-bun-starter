/**
 * Weekly plan proposals: read them, accept one, or dismiss one.
 *
 * Accepting is the ONLY path by which a proposal reaches the plan. The cron
 * that generates them never writes to `training_plans`.
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { getActivePlan } from '@/lib/db/plans';
import { selectLastQuiet, selectPendingProposal } from '@/lib/coach/proposal-select';

interface ProposalRow {
  id: string;
  plan_id: string | null;
  week_start: string;
  triggers: { code: string; detail: string; urgent: boolean }[];
  proposal: { weeks?: Record<string, unknown>[] } | null;
  summary: string | null;
  status: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth.userId) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 8), 30);
  const { data, error } = await supabase
    .from('plan_proposals')
    .select('id,plan_id,week_start,triggers,proposal,summary,status,created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as ProposalRow[];
  const plan = await getActivePlan(auth.userId);
  return NextResponse.json({
    // The one awaiting a decision: only for the plan active NOW and only while
    // it is the newest weekly result (see selectPendingProposal).
    pending: selectPendingProposal(rows, plan?.id ?? null),
    lastQuiet: selectLastQuiet(rows, plan?.id ?? null),
    proposals: rows,
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth.userId) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { id?: string; action?: string };
  if (!body.id || (body.action !== 'accept' && body.action !== 'dismiss')) {
    return NextResponse.json({ error: 'Expected { id, action: "accept" | "dismiss" }' }, { status: 400 });
  }

  const { data: row } = await supabase
    .from('plan_proposals')
    .select('id,plan_id,proposal,status')
    .eq('id', body.id)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  const proposal = row as ProposalRow;
  if (proposal.status !== 'pending') {
    return NextResponse.json({ error: `Proposal is already ${proposal.status}` }, { status: 409 });
  }

  if (body.action === 'dismiss') {
    await supabase
      .from('plan_proposals')
      .update({ status: 'dismissed', decided_at: new Date().toISOString() })
      .eq('id', proposal.id);
    return NextResponse.json({ ok: true, status: 'dismissed' });
  }

  const weeks = proposal.proposal?.weeks;
  if (!Array.isArray(weeks) || weeks.length === 0) {
    return NextResponse.json(
      { error: 'This proposal carries no plan changes to apply — dismiss it instead.' },
      { status: 400 },
    );
  }

  const plan = await getActivePlan(auth.userId);
  if (!plan) return NextResponse.json({ error: 'No active plan to apply this to.' }, { status: 409 });

  // Merge by week_number, same rule the manual adjust route uses: an adjusted
  // week replaces its counterpart, everything else is untouched.
  const existingWeeks = (plan.plan_json?.weeks ?? []) as unknown as Record<string, unknown>[];
  const merged = [...existingWeeks];
  for (const week of weeks as Record<string, unknown>[]) {
    const idx = merged.findIndex((w) => w.week_number === week.week_number);
    if (idx !== -1) merged[idx] = week;
    else merged.push(week);
  }
  merged.sort((a, b) => Number(a.week_number) - Number(b.week_number));

  const { error: updateError } = await supabase
    .from('training_plans')
    .update({
      plan_json: {
        ...plan.plan_json,
        weeks: merged,
        last_adjusted: new Date().toISOString(),
        adjustment_history: [
          ...((plan.plan_json?.adjustment_history as unknown[]) ?? []),
          { date: new Date().toISOString(), type: 'weekly_proposal', proposal_id: proposal.id },
        ],
      },
    })
    .eq('id', plan.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase
    .from('plan_proposals')
    .update({ status: 'accepted', decided_at: new Date().toISOString() })
    .eq('id', proposal.id);

  return NextResponse.json({ ok: true, status: 'accepted', weeksChanged: weeks.length });
}
