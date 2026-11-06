'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertTriangle, CalendarClock } from 'lucide-react';

interface Proposal {
  id: string;
  week_start: string;
  triggers: { code: string; detail: string; urgent: boolean }[];
  proposal: { weeks?: { week_number: number; total_km?: number; total_elevation_gain_m?: number | null }[] } | null;
  summary: string | null;
  status: string;
  created_at: string;
}

/**
 * The Saturday proposal, and its decision.
 *
 * Renders nothing at all when there is nothing pending. That is deliberate and
 * it is the common case — a loop that shows a card every week teaches the
 * athlete to click through it without reading, which is the same as not having
 * the loop.
 *
 * The last "no change" result is shown as one quiet line instead, so a silent
 * week is still visibly a *result* rather than a cron that might be broken.
 */
export function PlanProposalCard({ onApplied }: { onApplied?: () => void }) {
  const [pending, setPending] = useState<Proposal | null>(null);
  const [lastQuiet, setLastQuiet] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/coach/proposals');
      if (!res.ok) return;
      const data = await res.json();
      setPending(data.pending ?? null);
      setLastQuiet(data.lastQuiet ?? null);
    } catch {
      // A proposal is an enhancement; failing to load one must not break the page.
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(action: 'accept' | 'dismiss') {
    if (!pending) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/coach/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pending.id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not apply that.');
        return;
      }
      setPending(null);
      await load();
      if (action === 'accept') onApplied?.();
    } finally {
      setBusy(false);
    }
  }

  if (!pending) {
    if (!lastQuiet) return null;
    return (
      <div className="rc-card p-4 flex items-start gap-2.5">
        <CalendarClock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--rc-ink-4)' }} />
        <div className="text-[12px]" style={{ color: 'var(--rc-ink-3)' }}>
          <span className="rc-mono uppercase text-[10.5px]" style={{ letterSpacing: '0.06em' }}>
            Week of {lastQuiet.week_start}
          </span>
          <p className="mt-0.5">{lastQuiet.summary}</p>
        </div>
      </div>
    );
  }

  const weeks = pending.proposal?.weeks ?? [];

  return (
    <div className="rc-card p-5" style={{ border: '1px solid var(--rc-blue)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--rc-blue-deep)' }} />
        <div className="rc-kicker">Proposed change · week of {pending.week_start}</div>
      </div>

      <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--rc-ink)' }}>
        {pending.summary}
      </p>

      {/* What fired. Shown because a change whose reason is hidden is a change
          that gets accepted without thought. */}
      {pending.triggers?.length > 0 && (
        <ul className="mb-3 space-y-1">
          {pending.triggers.map((t) => (
            <li key={t.code} className="text-[12px] flex gap-2" style={{ color: 'var(--rc-ink-3)' }}>
              <span
                className="rc-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 h-fit"
                style={{
                  background: t.urgent ? 'var(--rc-bad-soft, oklch(0.95 0.04 25))' : 'var(--rc-surface-2)',
                  color: t.urgent ? 'oklch(0.45 0.18 25)' : 'var(--rc-ink-3)',
                }}
              >
                {t.code}
              </span>
              <span>{t.detail}</span>
            </li>
          ))}
        </ul>
      )}

      {weeks.length > 0 && (
        <div className="mb-3 text-[12px] rc-mono" style={{ color: 'var(--rc-ink-3)' }}>
          Affects {weeks.length} week{weeks.length === 1 ? '' : 's'}:{' '}
          {weeks
            .map((w) =>
              `wk${w.week_number}${w.total_km ? ` ${w.total_km}km` : ''}` +
              (typeof w.total_elevation_gain_m === 'number' ? ` / ${w.total_elevation_gain_m}m` : ''),
            )
            .join(' · ')}
        </div>
      )}

      {error && (
        <p className="text-[12px] mb-2" style={{ color: 'oklch(0.5 0.18 25)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || weeks.length === 0}
          onClick={() => decide('accept')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium disabled:opacity-40"
          style={{ background: 'var(--rc-blue)', color: 'white' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Apply to my plan
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide('dismiss')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium disabled:opacity-40"
          style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink-2)' }}
        >
          <X className="w-3.5 h-3.5" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
