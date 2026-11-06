'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mountain, Flag, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { PlanBuildProgress } from '@/components/coach/plan-build-progress';
import { PlanBuildReport } from '@/components/coach/plan-build-report';
import type { PlanBuildView } from '@/lib/coach/plan-builder/view';
import type { BuildReport } from '@/lib/coach/plan-builder/types';
import { SeasonPhaseStatus, type SeasonStatusView } from '@/components/coach/season-phase-status';

interface Phase {
  phase_number: number;
  name: string;
  focus: string;
  weeks: number;
  weekly_km_range: [number, number] | null;
  weekly_vert_range_m: [number, number] | null;
  long_run_vert_ceiling_m: number | null;
  capability: string;
  exit_criteria: string[];
  key_sessions: string[];
  // The season head coach's brief (absent on seasons designed before briefs).
  goal?: string;
  why_this_length?: string;
  must_haves?: string[];
  avoid?: string[];
  watch_for?: string[];
  handoff?: string;
  kpis?: { id: string; label: string; metric: string; comparator: 'gte' | 'lte'; target: number; consecutive_weeks?: number }[];
}

export interface SeasonPlan {
  id: string;
  goal_name: string;
  race_date: string | null;
  race_distance_km: number | null;
  race_elevation_gain_m: number | null;
  horizon_weeks: number;
  phases: Phase[];
  rationale: string | null;
  revision: number;
  terrain_access?: string | null;
  start_date?: string | null;
  /** What the athlete told the head coach (null on seasons before 2026-11-06). */
  intake?: {
    targetTime?: string; recentRaceResult?: string; currentWeeklyKm?: number;
    addressesWhat?: string; limitations?: string; notes?: string; changeRequest?: string;
  } | null;
  /** How the staged builder designed and checked it. Absent on older seasons. */
  build_report?: BuildReport | null;
}

/**
 * The season, and the form that creates one.
 *
 * Reports the plan back to the parent via `onLoaded` so the block generator can
 * pass `macroPlanId` — a block that does not know its phase is a standalone
 * plan, which is valid but is not what someone with a season wants.
 */
export function SeasonPlanPanel({ onLoaded, onPlanBuilt }: {
  onLoaded?: (plan: SeasonPlan | null) => void;
  /** A phase's training plan was built — the page reloads the active plan. */
  onPlanBuilt?: () => void;
}) {
  const [plan, setPlan] = useState<SeasonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null = form closed; 'new' = a fresh season; 'adjust' = revise the active one.
  const [formMode, setFormMode] = useState<'new' | 'adjust' | null>(null);
  const showForm = formMode !== null;
  const [expanded, setExpanded] = useState<number | null>(null);
  const [build, setBuild] = useState<PlanBuildView | null>(null);
  const [status, setStatus] = useState<SeasonStatusView | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/coach/season/status');
      if (res.ok) setStatus((await res.json()).status ?? null);
    } catch { /* the status card simply stays hidden */ }
  }, []);

  const [goalName, setGoalName] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [horizonWeeks, setHorizonWeeks] = useState('');
  const [raceDistanceKm, setRaceDistanceKm] = useState('');
  const [raceElevationGainM, setRaceElevationGainM] = useState('');
  const [terrainAccess, setTerrainAccess] = useState('');
  // Intake — what the head coach should know beyond the race itself.
  const [targetTime, setTargetTime] = useState('');
  const [recentRaceResult, setRecentRaceResult] = useState('');
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState('');
  const [addressesWhat, setAddressesWhat] = useState('');
  const [limitations, setLimitations] = useState('');
  const [notes, setNotes] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [rebuildPlan, setRebuildPlan] = useState(true);

  /** Open the form empty (new season) or filled from the active one (adjust). */
  function openForm(mode: 'new' | 'adjust') {
    const from = mode === 'adjust' ? plan : null;
    const i = from?.intake ?? {};
    setGoalName(from?.goal_name ?? '');
    setRaceDate(from?.race_date ?? '');
    setHorizonWeeks('');
    setRaceDistanceKm(from?.race_distance_km != null ? String(from.race_distance_km) : '');
    setRaceElevationGainM(from?.race_elevation_gain_m != null ? String(from.race_elevation_gain_m) : '');
    setTerrainAccess(from?.terrain_access ?? '');
    setTargetTime(i.targetTime ?? '');
    setRecentRaceResult(i.recentRaceResult ?? '');
    setCurrentWeeklyKm(i.currentWeeklyKm != null ? String(i.currentWeeklyKm) : '');
    setAddressesWhat(i.addressesWhat ?? '');
    setLimitations(i.limitations ?? '');
    setNotes(i.notes ?? '');
    setChangeRequest('');
    setRebuildPlan(true);
    setError(null);
    setFormMode(mode);
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/coach/macro-plan');
      if (!res.ok) return;
      const data = await res.json();
      setPlan(data.macroPlan ?? null);
      onLoaded?.(data.macroPlan ?? null);
    } finally {
      setLoading(false);
    }
  }, [onLoaded]);

  useEffect(() => {
    load();
    loadStatus();
  }, [load, loadStatus]);

  /**
   * Weeks between today and the race, so the horizon is not typed by hand and
   * then quietly wrong. Only a suggestion — the athlete can override.
   */
  useEffect(() => {
    if (!raceDate || horizonWeeks) return;
    const weeks = Math.round((Date.parse(raceDate) - Date.now()) / (7 * 24 * 3600 * 1000));
    if (weeks > 0) setHorizonWeeks(String(weeks));
  }, [raceDate, horizonWeeks]);

  /**
   * Drive a staged season build (lib/coach/plan-builder/season.ts) one stage
   * per request, the same way the block builder does.
   */
  /** Run a staged build to its end, one stage per request. */
  async function drive(initial: PlanBuildView): Promise<PlanBuildView> {
    let current = initial;
    setBuild(current);
    while (current.stage !== 'done' && current.stage !== 'failed') {
      const res = current.busy
        ? await new Promise((r) => setTimeout(r, 5000)).then(() => fetch(`/api/coach/plans/build?id=${current.id}`))
        : await fetch('/api/coach/plans/build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buildId: current.id }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.build) throw new Error(data.error || `Build step failed (${res.status})`);
      current = data.build as PlanBuildView;
      setBuild(current);
    }
    if (current.stage === 'failed') throw new Error(current.error || 'The build failed. Nothing was changed.');
    return current;
  }

  /** A season build finished: show it, then build phase 1 straight away. */
  async function runBuild(initial: PlanBuildView, rebuildPhaseOne = true) {
    const done = await drive(initial);
    if (!done.season) throw new Error('The build finished without a season');
    const saved = done.season as unknown as SeasonPlan;
    setPlan(saved);
    onLoaded?.(saved);
    setFormMode(null);
    await loadStatus();
    // A new season builds phase 1 straight away. An adjustment may keep the
    // current plan — the athlete chose with the checkbox.
    if (rebuildPhaseOne) await buildPhase(saved.id, 1);
  }

  /** Build one season phase (or extend the current one) as a training plan. */
  async function buildPhase(macroPlanId: string, phaseNumber: number, extensionWeeks?: number) {
    setGenerating(true);
    setError(null);
    setBuild(null);
    try {
      const res = await fetch('/api/coach/plans/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'phase', macroPlanId, phaseNumber, ...(extensionWeeks ? { extensionWeeks } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.build) throw new Error(data.error ?? 'Could not start building the phase.');
      await drive(data.build as PlanBuildView);
      onPlanBuilt?.();
      await Promise.all([load(), loadStatus()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the phase.');
    } finally {
      setGenerating(false);
    }
  }

  // Resume a season build left running by a reload or a closed tab.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/coach/plans/build?kind=season');
        if (!res.ok) return;
        const { build: open } = await res.json();
        if (!open) return;
        setGenerating(true);
        await runBuild(open);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not resume the season build.');
      } finally {
        setGenerating(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setGenerating(true);
    setError(null);
    setBuild(null);
    try {
      const res = await fetch('/api/coach/plans/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'season',
          goalName,
          horizonWeeks: parseInt(horizonWeeks, 10),
          ...(raceDate ? { raceDate } : {}),
          ...(raceDistanceKm ? { raceDistanceKm: parseFloat(raceDistanceKm) } : {}),
          ...(raceElevationGainM ? { raceElevationGainM: parseInt(raceElevationGainM, 10) } : {}),
          ...(terrainAccess ? { terrainAccess } : {}),
          ...(targetTime ? { targetTime } : {}),
          ...(recentRaceResult ? { recentRaceResult } : {}),
          ...(currentWeeklyKm ? { currentWeeklyKm: parseFloat(currentWeeklyKm) } : {}),
          ...(addressesWhat ? { addressesWhat } : {}),
          ...(limitations ? { limitations } : {}),
          ...(notes ? { notes } : {}),
          ...(formMode === 'adjust' && plan ? { adjustsSeasonId: plan.id, ...(changeRequest ? { changeRequest } : {}) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.build) throw new Error(data.error ?? 'Could not start designing the season.');
      await runBuild(data.build as PlanBuildView, formMode === 'adjust' ? rebuildPlan : true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not design the season.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return null;

  const gradient =
    plan?.race_elevation_gain_m && plan?.race_distance_km
      ? plan.race_elevation_gain_m / plan.race_distance_km
      : null;

  return (
    <div className="rc-card p-0 overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 pt-5 pb-3.5" style={{ borderBottom: '1px solid var(--rc-line)' }}>
        <div>
          <div className="rc-kicker mb-1">Season</div>
          <h3 className="text-[18px] font-bold" style={{ letterSpacing: '-0.015em', color: 'var(--rc-ink)' }}>
            {plan ? plan.goal_name : 'No season plan yet'}
          </h3>
          {plan && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--rc-ink-3)' }}>
              {plan.horizon_weeks} weeks · {plan.phases.length} phases
              {plan.start_date ? ` · starts ${plan.start_date}` : ''}
              {plan.race_date ? ` · race ${plan.race_date}` : ''}
              {plan.race_date ? ` (${Math.max(0, Math.ceil((Date.parse(plan.race_date) - Date.now()) / (7 * 24 * 3600 * 1000)))} wk away)` : ''}
              {gradient !== null ? ` · ${gradient.toFixed(1)} m/km` : ''}
              {plan.revision > 1 ? ` · revision ${plan.revision}` : ''}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'oklch(0.96 0.04 145)', color: 'oklch(0.42 0.14 145)' }}>
          <Flag className="w-4 h-4" />
        </div>
      </div>

      <div className="p-6">
        {plan && plan.rationale && (
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--rc-ink-2)' }}>
            {plan.rationale}
          </p>
        )}

        {plan && status && (
          <SeasonPhaseStatus
            status={status}
            busy={generating}
            phaseCount={plan.phases.length}
            onBuild={(n, ext) => buildPhase(plan.id, n, ext)}
          />
        )}

        {plan && (
          <div className="space-y-2 mb-4">
            {plan.phases.map((p) => {
              const open = expanded === p.phase_number;
              return (
                <div key={p.phase_number} className="rounded-xl" style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)' }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : p.phase_number)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold" style={{ color: 'var(--rc-ink)' }}>
                        {p.phase_number}. {p.name}
                        <span className="rc-mono font-normal text-[11px] ml-2" style={{ color: 'var(--rc-ink-4)' }}>
                          {p.weeks}w
                        </span>
                        <PhaseChip status={status} phaseNumber={p.phase_number} />
                      </div>
                      <div className="text-[12px] truncate" style={{ color: 'var(--rc-ink-3)' }}>{p.focus}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {p.weekly_vert_range_m && (
                        <span className="rc-mono text-[11px] flex items-center gap-1" style={{ color: 'oklch(0.45 0.14 145)' }}>
                          <Mountain className="w-3 h-3" />
                          {p.weekly_vert_range_m[0]}–{p.weekly_vert_range_m[1]}m
                        </span>
                      )}
                      {open ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--rc-ink-4)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--rc-ink-4)' }} />}
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 space-y-2.5 text-[12.5px]" style={{ color: 'var(--rc-ink-2)' }}>
                      {p.goal && <p><strong>Goal:</strong> {p.goal}{p.why_this_length ? <span style={{ color: 'var(--rc-ink-3)' }}> — {p.why_this_length}</span> : null}</p>}
                      <p><strong>Building:</strong> {p.capability}</p>
                      <BriefList title="KPIs" items={p.kpis?.map((k) => k.label)} />
                      <BriefList title="Must-haves" items={p.must_haves} />
                      <BriefList title="Don&apos;ts" items={p.avoid} />
                      <BriefList title="Watch for" items={p.watch_for} />
                      {p.handoff && <p><strong>Hands over:</strong> {p.handoff}</p>}
                      {p.weekly_km_range && <p className="rc-mono text-[11.5px]" style={{ color: 'var(--rc-ink-3)' }}>
                        {p.weekly_km_range[0]}–{p.weekly_km_range[1]} km/wk
                        {p.long_run_vert_ceiling_m ? ` · long-run vert ceiling ${p.long_run_vert_ceiling_m} m` : ''}
                      </p>}
                      {/* Exit criteria are the mechanism, so they are shown in
                          full rather than summarised — a phase advances when
                          these hold, not when its weeks run out. */}
                      <div>
                        <p className="rc-mono text-[10.5px] uppercase mb-1" style={{ color: 'var(--rc-ink-4)', letterSpacing: '0.08em' }}>
                          Advances when all of these hold
                        </p>
                        <ul className="space-y-1">
                          {p.exit_criteria.map((c, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: 'var(--rc-ink-4)' }}>·</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {p.key_sessions?.length > 0 && (
                        <p style={{ color: 'var(--rc-ink-3)' }}><strong>Key sessions:</strong> {p.key_sessions.join('; ')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {plan?.build_report && <div className="mb-4"><PlanBuildReport report={plan.build_report} unit="Phase" /></div>}

        {build && (generating || build.stage === 'failed') && <div className="mb-4"><PlanBuildProgress build={build} /></div>}

        {plan?.intake && !showForm && <IntakeSummary intake={plan.intake} />}

        {!showForm && !generating && (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {plan && (
              <button type="button" onClick={() => openForm('adjust')} className="text-[13px] font-medium" style={{ color: 'var(--rc-blue-deep)' }}>
                Adjust this season →
              </button>
            )}
            <button type="button" onClick={() => openForm('new')} className="text-[13px] font-medium" style={{ color: plan ? 'var(--rc-ink-3)' : 'var(--rc-blue-deep)' }}>
              {plan ? 'Design a new season (replaces this one) →' : 'Design a season →'}
            </button>
          </div>
        )}

        {showForm && (
          <div className="space-y-3 pt-1">
            {plan && (
              <p className="text-[12px]" style={{ color: 'var(--rc-ink-3)' }}>
                {formMode === 'adjust'
                  ? 'The head coach sees this season, where you are in it, and what you want changed — and keeps what was sound. '
                  : ''}
                The current season is kept and marked superseded, not deleted — so you can still see why it changed.
              </p>
            )}

            {formMode === 'adjust' && (
              <Field label="What should change?">
                <textarea value={changeRequest} onChange={(e) => setChangeRequest(e.target.value)} rows={3}
                  placeholder="e.g. I can only run 3 days a week from January; start climbing work earlier; the race moved to 10 July"
                  className={INPUT} style={INPUT_STYLE} />
              </Field>
            )}

            <SectionLabel>The race</SectionLabel>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Goal">
                <input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="21K trail race, 1300m gain" className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Race date">
                <input type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Horizon (weeks)">
                <input type="number" min="4" max="104" value={horizonWeeks} onChange={(e) => setHorizonWeeks(e.target.value)} placeholder="auto from race date" className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Target time">
                <input value={targetTime} onChange={(e) => setTargetTime(e.target.value)} placeholder="e.g. 3:15:00, or 'finish strong'" className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Race distance (km)">
                <input type="number" step="0.1" value={raceDistanceKm} onChange={(e) => setRaceDistanceKm(e.target.value)} placeholder="21" className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Race elevation gain (m)">
                <input type="number" step="10" value={raceElevationGainM} onChange={(e) => setRaceElevationGainM(e.target.value)} placeholder="1300" className={INPUT} style={INPUT_STYLE} />
              </Field>
            </div>

            <SectionLabel>You</SectionLabel>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Recent race or time trial">
                <input value={recentRaceResult} onChange={(e) => setRecentRaceResult(e.target.value)} placeholder="e.g. 10K in 52:30, Oct 2026" className={INPUT} style={INPUT_STYLE} />
              </Field>
              <Field label="Current weekly km (optional)">
                <input type="number" step="1" value={currentWeeklyKm} onChange={(e) => setCurrentWeeklyKm(e.target.value)} placeholder="measured from your runs if empty" className={INPUT} style={INPUT_STYLE} />
              </Field>
            </div>
            <Field label="Terrain you can train on">
              <input value={terrainAccess} onChange={(e) => setTerrainAccess(e.target.value)} placeholder="flat roads locally; hills 40 min drive; gym stairs + treadmill" className={INPUT} style={INPUT_STYLE} />
            </Field>
            <Field label="Limitations to respect">
              <textarea value={limitations} onChange={(e) => setLimitations(e.target.value)} rows={2}
                placeholder="injuries, days you cannot train, travel, longest session you can fit, equipment you do not have"
                className={INPUT} style={INPUT_STYLE} />
            </Field>
            <Field label="What should the season focus on?">
              <textarea value={addressesWhat} onChange={(e) => setAddressesWhat(e.target.value)} rows={2}
                placeholder="e.g. climbing strength, legs that survive the descents, consistency"
                className={INPUT} style={INPUT_STYLE} />
            </Field>
            <Field label="Anything else the coach should know">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={INPUT} style={INPUT_STYLE} />
            </Field>

            {formMode === 'adjust' && (
              <label className="flex items-start gap-2 text-[12.5px]" style={{ color: 'var(--rc-ink-2)' }}>
                <input type="checkbox" checked={rebuildPlan} onChange={(e) => setRebuildPlan(e.target.checked)} className="mt-0.5" />
                <span>Rebuild my current training plan from the new season&apos;s phase 1. Untick to keep the plan you have now; you can build it later from the phase card.</span>
              </label>
            )}

            {error && <p className="text-[12px]" style={{ color: 'oklch(0.5 0.18 25)' }}>{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={generate}
                disabled={generating || !goalName || !horizonWeeks}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium disabled:opacity-40"
                style={{ background: 'var(--rc-blue)', color: 'white' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? (build?.label ? `${build.label}…` : 'Starting…') : formMode === 'adjust' ? 'Revise season' : 'Design season'}
              </button>
              <button
                type="button"
                onClick={() => setFormMode(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink-2)' }}
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--rc-ink-4)' }}>
              The season sets phase targets, KPIs and exit criteria — no daily workouts. Each phase is built as a training plan when it is due. Takes about 6 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const INPUT = 'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2';
const INPUT_STYLE = { background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PhaseChip({ status, phaseNumber }: { status: SeasonStatusView | null; phaseNumber: number }) {
  const t = status?.timeline.find((x) => x.phaseNumber === phaseNumber);
  if (!t) return null;
  const active = t.status === 'active';
  return (
    <span
      className="rc-mono font-normal text-[10px] ml-2 px-1.5 py-0.5 rounded"
      style={{ background: active ? 'var(--rc-blue-soft)' : 'var(--rc-surface)', color: active ? 'var(--rc-blue-deep)' : 'var(--rc-ink-4)' }}
    >
      {t.status.toUpperCase()} · {t.projected ? '~' : ''}{t.start.slice(5)} → {t.end.slice(5)}{t.extensionWeeks ? ` (+${t.extensionWeeks} wk)` : ''}
    </span>
  );
}

function BriefList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="rc-mono text-[10.5px] uppercase mb-1" style={{ color: 'var(--rc-ink-4)', letterSpacing: '0.08em' }}>{title}</p>
      <ul className="space-y-0.5">{items.map((m, i) => <li key={i}>· {m}</li>)}</ul>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="rc-mono text-[10.5px] uppercase pt-1" style={{ color: 'var(--rc-ink-4)', letterSpacing: '0.08em' }}>
      {children}
    </p>
  );
}

/** What the head coach was told when this season was designed. */
function IntakeSummary({ intake }: { intake: NonNullable<SeasonPlan['intake']> }) {
  const rows: [string, string | undefined][] = [
    ['Target time', intake.targetTime],
    ['Recent result', intake.recentRaceResult],
    ['Weekly km you reported', intake.currentWeeklyKm != null ? String(intake.currentWeeklyKm) : undefined],
    ['Focus', intake.addressesWhat],
    ['Limitations', intake.limitations],
    ['Notes', intake.notes],
    ['Last change you asked for', intake.changeRequest],
  ];
  const shown = rows.filter(([, v]) => v);
  if (!shown.length) return null;
  return (
    <div className="rounded-xl p-4 mb-4 text-[12.5px] space-y-1" style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink-2)' }}>
      <div className="rc-kicker mb-1">What you told the coach</div>
      {shown.map(([k, v]) => (
        <p key={k}><strong>{k}:</strong> {v}</p>
      ))}
    </div>
  );
}
