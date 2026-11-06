'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Target, ChevronLeft, ChevronRight, Sparkles, Calendar, Home, CheckCircle2, Mountain } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { TrainingPlan, PlanWeek, Workout } from '@/lib/db/types';
import { isWorkoutToday, sortWorkoutsByDay } from '@/lib/utils/week-calculator';
import { StrengthWorkout } from '@/components/coach/strength-workout';
import { WorkoutCard, getWorkoutTagClass } from '@/components/coach/workout-card';
import { PushToWatch } from '@/components/coach/push-to-watch';
import { PlanProposalCard } from '@/components/coach/plan-proposal-card';
import { SeasonPlanPanel, type SeasonPlan } from '@/components/coach/season-plan';
import { PlanBuildProgress } from '@/components/coach/plan-build-progress';
import { PlanBuildReport } from '@/components/coach/plan-build-report';
import type { PlanBuildView } from '@/lib/coach/plan-builder/view';
import type { BuildReport } from '@/lib/coach/plan-builder/types';

const planTypes = [
  { value: 'half-marathon', label: 'Half Marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: '10k', label: '10K' },
  { value: '5k-speed', label: '5K Speed' },
  { value: 'base-building', label: 'Base Building' },
  { value: 'maintenance', label: 'Maintenance' },
  // Distance stopped describing the goal once elevation entered the picture.
  // The race-profile fields below are what actually shape the plan — this type
  // only nudges the phase split.
  { value: 'trail-mountain', label: 'Trail / Mountain' },
];

const durationOptions = [4, 6, 8, 10, 12, 16];
const runsPerWeekOptions = [3, 4, 5, 6, 7];

/**
 * Sunday first — this athlete trains on an Israeli week, where Sunday is a
 * workday and Friday-Saturday is the weekend. A Monday-first picker quietly
 * suggests the wrong shape.
 */
const WEEKDAY_OPTIONS = [
  { value: 'Sunday', short: 'Sun' },
  { value: 'Monday', short: 'Mon' },
  { value: 'Tuesday', short: 'Tue' },
  { value: 'Wednesday', short: 'Wed' },
  { value: 'Thursday', short: 'Thu' },
  { value: 'Friday', short: 'Fri' },
  { value: 'Saturday', short: 'Sat' },
] as const;

export default function TrainingPlanPage() {
  const [planType, setPlanType] = useState('');
  const [duration, setDuration] = useState('8');
  const [runsPerWeek, setRunsPerWeek] = useState('4');
  // Which days this plan may schedule on. Empty = fall back to the profile,
  // which is what the server does. Prefilled from the profile below so the
  // common case is one glance and no clicks, and a change is deliberate.
  const [trainingDays, setTrainingDays] = useState<string[]>([]);
  const [trainingDayNotes, setTrainingDayNotes] = useState('');
  const [profileDays, setProfileDays] = useState<string | null>(null);

  // Seed the picker from the saved profile so the default is the athlete's
  // real week rather than an invented one. Best-effort: a failure here leaves
  // the picker empty, which the server reads as "use the profile" — the same
  // behaviour as before this control existed.
  useEffect(() => {
    fetch('/api/coach/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const days: string | undefined = data?.profile?.training_days ?? data?.training_days;
        if (!days) return;
        setProfileDays(days);
        setTrainingDays(WEEKDAY_OPTIONS.filter((d) => days.includes(d.value)).map((d) => d.value));
      })
      .catch(() => {});
  }, []);
  const [notes, setNotes] = useState('');
  // Rich plan-gen intake (server reads these into the PLAN GENERATION INTAKE
  // block; gives Opus the runway it needs beyond the default 14-day RAG.)
  const [raceDate, setRaceDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  // Race profile. Elevation is the field that changes the plan's shape rather
  // than its numbers — 21 km flat and 21 km with 1300 m of climb share a
  // distance and almost nothing else.
  const [raceDistanceKm, setRaceDistanceKm] = useState('');
  const [raceElevationGainM, setRaceElevationGainM] = useState('');
  const [terrainAccess, setTerrainAccess] = useState('');
  // The season this block will serve, when one exists. useCallback-stable so
  // the panel's effect does not re-fire on every render.
  const [season, setSeason] = useState<SeasonPlan | null>(null);
  // Which season phase this plan builds ('' = a standalone plan).
  const [phaseNumber, setPhaseNumber] = useState('');
  const handleSeasonLoaded = useCallback((p: SeasonPlan | null) => setSeason(p), []);
  const [recentRaceResult, setRecentRaceResult] = useState('');
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState('');
  const [addressesWhat, setAddressesWhat] = useState('');
  const [limitations, setLimitations] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingWeek, setViewingWeek] = useState(1);
  const [calculatedCurrentWeek, setCalculatedCurrentWeek] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('season');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Staged build progress (see lib/coach/plan-builder)
  const [build, setBuild] = useState<PlanBuildView | null>(null);

  useEffect(() => {
    fetchPlan();
    resumeBuild();
    // The season is loaded here too (not only by the Season tab's panel) so
    // the New plan form can offer "which phase is this plan for".
    fetch('/api/coach/macro-plan')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.macroPlan) setSeason(d.macroPlan); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/coach/plans');
      if (response.ok) {
        const data = await response.json();
        if (data.plan) {
          setActivePlan(data.plan);
          const currentWeek = data.plan.current_week_num || 1;
          setCalculatedCurrentWeek(currentWeek);
          setViewingWeek(currentWeek);
          setActiveTab('current');
        }
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const jumpToCurrentWeek = () => {
    setViewingWeek(calculatedCurrentWeek);
  };

  const isViewingCurrentWeek = viewingWeek === calculatedCurrentWeek;

  /**
   * Drive a staged build to completion: one request per stage, so no single
   * request approaches the server's time limit. `busy` means another tab (or
   * an earlier request still running) holds the stage — wait and re-read
   * instead of paying for the same model call twice.
   */
  const runBuild = async (initial: PlanBuildView) => {
    let current = initial;
    setBuild(current);
    while (current.stage !== 'done' && current.stage !== 'failed') {
      let response: Response;
      if (current.busy) {
        await new Promise((r) => setTimeout(r, 5000));
        response = await fetch(`/api/coach/plans/build?id=${current.id}`);
      } else {
        response = await fetch('/api/coach/plans/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buildId: current.id }),
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.build) throw new Error(data.error || `Build step failed (${response.status})`);
      current = data.build as PlanBuildView;
      setBuild(current);
    }
    if (current.stage === 'failed') throw new Error(current.error || 'The plan build failed. Your current plan is unchanged.');
    if (!current.plan) throw new Error('The build finished without a plan');
    setActivePlan(current.plan);
    setCalculatedCurrentWeek(1);
    setViewingWeek(1);
    setSuccessMessage('Your training plan has been built and checked.');
    setActiveTab('current');
  };

  /** Pick up a build left running by a reload or a closed tab. */
  const resumeBuild = async () => {
    try {
      const response = await fetch('/api/coach/plans/build');
      if (!response.ok) return;
      const { build: open } = await response.json();
      if (!open) return;
      setGenerating(true);
      setActiveTab('generate');
      await runBuild(open);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume the plan build');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setBuild(null);

    try {
      const response = await fetch('/api/coach/plans/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planTypes.find(p => p.value === planType)?.label || planType,
          durationWeeks: parseInt(duration),
          runsPerWeek: parseInt(runsPerWeek),
          // Omitted entirely when nothing is picked, so the server falls back
          // to the profile rather than receiving an empty array — "not stated"
          // and "no days at all" are different requests.
          ...(trainingDays.length > 0 ? { trainingDays } : {}),
          ...(trainingDayNotes ? { trainingDayNotes } : {}),
          // Ties the block to the season so the generator is told which phase
          // it is writing for. Omitted when there is no season — the block is
          // then a valid standalone plan.
          ...(season && phaseNumber ? { macroPlanId: season.id, phaseNumber: parseInt(phaseNumber, 10) } : {}),
          notes,
          // Rich intake. Each field is optional; omit empty strings so Zod accepts them.
          ...(raceDate ? { raceDate } : {}),
          ...(targetTime ? { targetTime } : {}),
          ...(raceDistanceKm ? { raceDistanceKm: parseFloat(raceDistanceKm) } : {}),
          ...(raceElevationGainM ? { raceElevationGainM: parseInt(raceElevationGainM, 10) } : {}),
          ...(terrainAccess ? { terrainAccess } : {}),
          ...(recentRaceResult ? { recentRaceResult } : {}),
          ...(currentWeeklyKm ? { currentWeeklyKm: parseFloat(currentWeeklyKm) } : {}),
          ...(addressesWhat ? { addressesWhat } : {}),
          ...(limitations ? { limitations } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.build) throw new Error(data.error || `Could not start the build (${response.status})`);
      await runBuild(data.build as PlanBuildView);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const getPlanWeeks = (): PlanWeek[] => {
    if (!activePlan?.plan_json) return [];
    const planJson = activePlan.plan_json;
    if (planJson.weeks && Array.isArray(planJson.weeks)) return planJson.weeks;
    if (planJson.raw_response) return [];
    return [];
  };

  const getCurrentWeekData = (): PlanWeek | null => {
    const weeks = getPlanWeeks();
    return weeks.find(w => w.week_number === viewingWeek) || null;
  };

  const getWeekDateRange = (weekNum: number): string => {
    if (!activePlan?.start_date) return '';
    const start = new Date(activePlan.start_date);
    start.setDate(start.getDate() + (weekNum - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const weekData = getCurrentWeekData();
  const totalWeeks = activePlan?.duration_weeks || getPlanWeeks().length || 0;
  // Whether this plan programmes its own strength anywhere. Checked across the
  // whole plan, not the viewed week, so the panel does not flicker in and out
  // as you page through weeks (a taper week may legitimately have none).
  const planHasStrength = getPlanWeeks().some((w) =>
    Object.values(w.workouts ?? {}).some((wo) => !!wo?.strength),
  );
  const planProgress = activePlan ? Math.round(((activePlan.current_week_num || 1) / (activePlan.duration_weeks || 1)) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" style={{ background: 'rgba(14,15,12,0.06)' }} />
        <Skeleton className="h-32 w-full" style={{ background: 'rgba(14,15,12,0.06)' }} />
        <Skeleton className="h-64 w-full" style={{ background: 'rgba(14,15,12,0.06)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="rc-kicker flex items-center gap-2.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--rc-blue)' }} />
          TRAINING PLAN
        </div>
        <h1
          className="text-[36px] md:text-[44px] font-bold leading-[1.05]"
          style={{ letterSpacing: '-0.03em', color: 'var(--rc-ink)' }}
        >
          Your plan,{' '}
          <span className="font-normal italic" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', color: 'var(--rc-ink-2)' }}>
            week by week.
          </span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--rc-ink-3)' }}>
          Generate and manage your AI-powered training plan.
        </p>
      </div>

      {/* Tab Toggle */}
      <div
        className="inline-flex gap-[1px] rounded-full p-[3px]"
        style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', boxShadow: 'var(--rc-shadow-1)' }}
      >
        {([
          ['season', 'SEASON', false],
          ['current', 'CURRENT PLAN', !activePlan],
          ['generate', 'NEW PLAN', false],
        ] as const).map(([key, label, disabled]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            disabled={disabled}
            className="rc-mono px-[13px] py-[7px] rounded-full text-[11px] font-medium transition-colors disabled:opacity-40"
            style={{
              background: activeTab === key ? 'var(--rc-ink)' : 'transparent',
              color: activeTab === key ? '#fff' : 'var(--rc-ink-3)',
              letterSpacing: '0.06em',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Current Plan Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {activePlan ? (
            <>
              {/* Plan Header Hero */}
              <div
                className="relative rounded-[28px] overflow-hidden"
                style={{ background: 'var(--rc-ink)', color: '#FBFAF6' }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(700px 320px at 105% 110%, oklch(0.45 0.16 245 / 0.55), transparent 60%)',
                  }}
                />
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="rc-kicker" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <Target className="w-3.5 h-3.5 inline mr-1.5" />
                        ACTIVE PLAN
                      </div>
                      <h2 className="text-[32px] font-bold mt-2" style={{ letterSpacing: '-0.025em' }}>
                        {activePlan.plan_type}
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Week {calculatedCurrentWeek} of {totalWeeks}
                        {activePlan.week_info?.weekDateRange && ` · ${activePlan.week_info.weekDateRange}`}
                      </p>
                    </div>
                    <span
                      className="rc-mono text-[10.5px] font-medium px-3 py-1.5 rounded-full"
                      style={{
                        background: activePlan.isAfterEnd ? 'oklch(0.96 0.05 75)' : 'oklch(0.96 0.04 150)',
                        color: activePlan.isAfterEnd ? 'oklch(0.50 0.13 75)' : 'oklch(0.42 0.10 150)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {activePlan.isAfterEnd ? 'COMPLETED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-6 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        {Array.from({ length: totalWeeks }).map((_, i) => (
                          <span
                            key={i}
                            className="flex-1 h-2 rounded-[3px]"
                            style={{
                              background: i < (activePlan.current_week_num || 1)
                                ? 'var(--rc-blue)'
                                : 'rgba(255,255,255,0.12)',
                              boxShadow: i === (activePlan.current_week_num || 1) - 1 ? '0 0 0 3px oklch(0.58 0.17 245 / 0.25)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 rc-mono text-[10.5px]" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                        <span>WEEK 1</span><span>WEEK {totalWeeks}</span>
                      </div>
                    </div>
                    <div
                      className="text-[48px] font-bold leading-none"
                      style={{
                        letterSpacing: '-0.03em',
                        fontVariantNumeric: 'tabular-nums',
                        background: 'linear-gradient(120deg, #fff, oklch(0.78 0.16 245))',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {planProgress}<span className="text-[20px] ml-1" style={{ color: 'rgba(255,255,255,0.55)', WebkitTextFillColor: 'rgba(255,255,255,0.55)' }}>%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week Navigation */}
              <div className="rc-card p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--rc-line)' }}>
                  <button
                    disabled={viewingWeek <= 1}
                    onClick={() => setViewingWeek(w => w - 1)}
                    className="w-9 h-9 rounded-full grid place-items-center transition-colors disabled:opacity-30"
                    style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)' }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: 'var(--rc-ink-2)' }} />
                  </button>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-[20px] font-bold" style={{ letterSpacing: '-0.02em', color: 'var(--rc-ink)' }}>
                        Week {viewingWeek}
                      </h3>
                      {isViewingCurrentWeek && (
                        <span
                          className="rc-mono text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--rc-blue)', color: '#fff', letterSpacing: '0.08em' }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--rc-ink-3)' }}>{getWeekDateRange(viewingWeek)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isViewingCurrentWeek && (
                      <button
                        onClick={jumpToCurrentWeek}
                        className="w-9 h-9 rounded-full grid place-items-center transition-colors"
                        style={{ background: 'var(--rc-blue-soft)', border: '1px solid var(--rc-line)', color: 'var(--rc-blue-deep)' }}
                        title="Jump to current week"
                      >
                        <Home className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      disabled={viewingWeek >= totalWeeks}
                      onClick={() => setViewingWeek(w => w + 1)}
                      className="w-9 h-9 rounded-full grid place-items-center transition-colors disabled:opacity-30"
                      style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)' }}
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--rc-ink-2)' }} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Saturday's proposal, when there is one awaiting a decision.
                      Renders nothing on a quiet week beyond a single line, so a
                      card never becomes something to click past unread. */}
                  <div className="mb-5">
                    <PlanProposalCard onApplied={() => window.location.reload()} />
                  </div>

                  {weekData?.focus && (
                    <p
                      className="text-sm text-center mb-5 py-2.5 px-4 rounded-xl"
                      style={{ background: 'var(--rc-blue-soft)', color: 'var(--rc-blue-deep)' }}
                    >
                      <strong>Focus:</strong> {weekData.focus}
                    </p>
                  )}

                  {/* Week targets. Vert renders only when the plan prescribed
                      it — a road plan shows km alone, exactly as before, and
                      an absent target is never drawn as 0 m. */}
                  {(weekData?.total_km || typeof weekData?.total_elevation_gain_m === 'number') && (
                    <div className="flex items-center justify-center gap-4 mb-5 text-[12px]" style={{ color: 'var(--rc-ink-3)' }}>
                      {weekData?.total_km ? (
                        <span className="rc-mono">{weekData.total_km} km planned</span>
                      ) : null}
                      {typeof weekData?.total_elevation_gain_m === 'number' && (
                        <span className="rc-mono flex items-center gap-1" style={{ color: 'oklch(0.45 0.14 145)' }}>
                          <Mountain className="w-3.5 h-3.5" />
                          {weekData.total_elevation_gain_m} m climb
                          {weekData.total_km
                            ? ` · ${(weekData.total_elevation_gain_m / weekData.total_km).toFixed(1)} m/km`
                            : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {weekData?.workouts && Object.keys(weekData.workouts).length > 0 ? (
                    <div className="space-y-3">
                      {sortWorkoutsByDay(weekData.workouts).map(([day, workout]) => {
                        const isToday = isViewingCurrentWeek && isWorkoutToday(day);
                        return (
                          <WorkoutCard
                            key={day}
                            day={day}
                            workout={workout}
                            isToday={isToday}
                            variant="card"
                          />
                        );
                      })}
                    </div>
                  ) : activePlan.plan_json?.raw_response ? (
                    <pre
                      className="whitespace-pre-wrap text-xs p-4 rounded-xl overflow-auto max-h-96"
                      style={{ background: 'var(--rc-surface-2)', color: 'var(--rc-ink-2)', border: '1px solid var(--rc-line)' }}
                    >
                      {activePlan.plan_json.raw_response}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--rc-ink-3)' }}>
                      <Calendar className="w-10 h-10 mb-3" style={{ color: 'var(--rc-ink-4)' }} />
                      <p className="text-sm font-medium">No workout details available for this week.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Send this week to the watch. Hides itself when intervals.icu
                  is not connected, so it costs nothing on an unconnected
                  account. */}
              <PushToWatch weekNumber={viewingWeek} currentWeek={calculatedCurrentWeek} />

              {/* Generic strength panel — ONLY for plans that do not programme
                  their own strength. Plans generated since 2026-09-26 attach
                  strength to training days (see the workout cards above);
                  showing this fixed 3-template panel beside them would put two
                  competing strength programmes on one screen. Older plans have
                  no strength field, so they keep the panel as before. */}
              {!planHasStrength && <StrengthWorkout weekNumber={viewingWeek} totalWeeks={totalWeeks} />}

              {(activePlan.plan_json as { build_report?: BuildReport }).build_report && (
                <PlanBuildReport report={(activePlan.plan_json as { build_report: BuildReport }).build_report} />
              )}
            </>
          ) : (
            <div className="rc-card">
              <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--rc-ink-3)' }}>
                <Target className="w-10 h-10 mb-3" style={{ color: 'var(--rc-ink-4)' }} />
                <p className="text-sm font-medium">No active training plan.</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="text-sm mt-2 underline"
                  style={{ color: 'var(--rc-blue)' }}
                >
                  Generate a new plan →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Season Tab — the season at a glance, its current phase, and where
          it is adjusted. Kept apart from building a single plan. */}
      {activeTab === 'season' && (
        <SeasonPlanPanel onLoaded={handleSeasonLoaded} onPlanBuilt={fetchPlan} />
      )}

      {/* New plan Tab */}
      {activeTab === 'generate' && (
        <>
        <div className="rc-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3.5" style={{ borderBottom: '1px solid var(--rc-line)' }}>
            <div>
              <div className="rc-kicker mb-1">AI-powered</div>
              <h3 className="text-[18px] font-bold" style={{ letterSpacing: '-0.015em', color: 'var(--rc-ink)' }}>Generate Training Plan</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${generating ? 'animate-pulse' : ''}`} style={{ background: 'var(--rc-blue-soft)', color: 'var(--rc-blue-deep)' }}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm" style={{ color: 'var(--rc-ink-3)' }}>
              Create a personalized plan based on the Run Elite Triphasic methodology.
            </p>

            {successMessage && (
              <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'var(--rc-good-soft)', color: 'oklch(0.42 0.10 150)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'oklch(0.95 0.05 25)', color: 'var(--rc-bad)' }}>
                {error}
              </div>
            )}

            {/* Plan Type */}
            <div className="space-y-2">
              <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Plan Type</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: planType ? 'var(--rc-ink)' : 'var(--rc-ink-4)' }}
              >
                <option value="" disabled>Select plan type...</option>
                {planTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Duration (weeks)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
              >
                {durationOptions.map((weeks) => (
                  <option key={weeks} value={weeks.toString()}>{weeks} weeks</option>
                ))}
              </select>
            </div>

            {/* Runs per Week */}
            <div className="space-y-2">
              <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Runs per Week</label>
              <select
                value={runsPerWeek}
                onChange={(e) => setRunsPerWeek(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
              >
                {runsPerWeekOptions.map((num) => (
                  <option key={num} value={num.toString()}>{num} runs/week</option>
                ))}
              </select>
            </div>

            {/* Training Days — which days the plan may use. Prefilled from the
                profile; changing it here affects THIS plan only and does not
                rewrite the saved profile, so a one-off block (travel, a heavy
                work month) cannot silently become the permanent default. */}
            <div className="space-y-2">
              <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>
                Training Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_OPTIONS.map((day) => {
                  const on = trainingDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setTrainingDays((prev) =>
                          prev.includes(day.value) ? prev.filter((d) => d !== day.value) : [...prev, day.value],
                        )
                      }
                      className="px-3 py-2 rounded-xl text-[12px] font-medium transition-colors"
                      style={{
                        background: on ? 'var(--rc-blue)' : 'var(--rc-surface-2)',
                        border: `1px solid ${on ? 'var(--rc-blue)' : 'var(--rc-line)'}`,
                        color: on ? 'white' : 'var(--rc-ink-3)',
                      }}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={trainingDayNotes}
                onChange={(e) => setTrainingDayNotes(e.target.value)}
                placeholder="Which day carries what — e.g. Monday quality, Friday long"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
              />

              {/* State the arithmetic rather than blocking on it. More runs
                  than days is a legitimate request — it means doubling up —
                  but it must be a visible choice, because the alternative is
                  the model quietly scheduling onto a day that was never
                  offered and the athlete then reading as having skipped it. */}
              {trainingDays.length > 0 && parseInt(runsPerWeek) > trainingDays.length && (
                <p className="text-[11px]" style={{ color: 'var(--rc-amber, oklch(0.55 0.14 75))' }}>
                  {runsPerWeek} runs across {trainingDays.length} days — some days will carry two sessions.
                </p>
              )}
              {trainingDays.length === 0 && (
                <p className="text-[11px]" style={{ color: 'var(--rc-ink-4)' }}>
                  {profileDays
                    ? `No days selected — the plan will use your saved days: ${profileDays}`
                    : 'No days selected, and none saved on your profile. The coach will ask rather than assume a schedule.'}
                </p>
              )}
            </div>

            {/* Which season phase this plan builds. One plan per phase: the
                phase's brief (goal, KPIs, ranges, must-haves, don'ts) becomes
                the builder's contract and its length sets the plan length.
                Usually built from the Season panel when the phase is due. */}
            {season && (
              <div className="space-y-2">
                <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>
                  Season phase
                </label>
                <select
                  value={phaseNumber}
                  onChange={(e) => {
                    setPhaseNumber(e.target.value);
                    const ph = season.phases.find((p) => String(p.phase_number) === e.target.value);
                    if (ph) setDuration(String(ph.weeks));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                >
                  <option value="">Standalone plan (not part of the season)</option>
                  {season.phases.map((p) => (
                    <option key={p.phase_number} value={String(p.phase_number)}>Phase {p.phase_number}: {p.name} ({p.weeks} wk)</option>
                  ))}
                </select>
                <p className="text-[11px]" style={{ color: 'var(--rc-ink-4)' }}>
                  A phase plan is built from the season head coach&apos;s brief for that phase and stays inside its ranges. You can also build it from the Season tab when it is due.
                </p>
              </div>
            )}

            {/* Rich intake — feeds the server's PLAN GENERATION INTAKE block.
                Everything here is optional; server auto-computes 90-day stats,
                PRs, and prior plan continuity regardless. These fields are the
                athlete-supplied half: race date, target time, recent race,
                what to address, limitations. The server-computed half is the
                last-90-days run history. Both go into the prompt. */}
            <div className="rc-card p-5 space-y-4" style={{ background: 'oklch(0.97 0.02 240)', border: '1px solid var(--rc-line)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--rc-blue-deep)' }} />
                <span className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-2)', letterSpacing: '0.08em' }}>
                  Plan Intake — give the model context
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--rc-ink-3)' }}>
                Everything below is optional. The server already pulls your last 90 days of runs, PRs across distances, and your prior plan&apos;s outcome — but these fields make the plan dramatically better when filled.
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Target race date</label>
                  <input
                    type="date"
                    value={raceDate}
                    onChange={e => setRaceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Target time</label>
                  <input
                    type="text"
                    value={targetTime}
                    onChange={e => setTargetTime(e.target.value)}
                    placeholder="e.g. 52:00 or 1:50:00"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Race distance (km)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={raceDistanceKm}
                    onChange={e => setRaceDistanceKm(e.target.value)}
                    placeholder="e.g. 21"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Race elevation gain (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={raceElevationGainM}
                    onChange={e => setRaceElevationGainM(e.target.value)}
                    placeholder="e.g. 1300"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                  />
                </div>
              </div>

              {/* The gradient, computed live. This is the number that decides
                  whether the plan is a road plan with hills in it or a
                  climbing plan — showing it here means the athlete sees what
                  he is actually asking for before he asks for it. */}
              {raceDistanceKm && raceElevationGainM && parseFloat(raceDistanceKm) > 0 && (
                <div
                  className="rounded-lg px-3 py-2.5 text-[12px]"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink-2)' }}
                >
                  <strong>{(parseInt(raceElevationGainM, 10) / parseFloat(raceDistanceKm)).toFixed(1)} m/km</strong>{' '}
                  average gradient. The plan will be built around this, with weekly climb targets, descent
                  treated as its own stressor, and long sessions prescribed in time-on-feet rather than pace.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Terrain you can actually train on</label>
                <input
                  type="text"
                  value={terrainAccess}
                  onChange={e => setTerrainAccess(e.target.value)}
                  placeholder="e.g. flat roads locally; Jerusalem hills ~40 min drive; gym stairs + treadmill"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                />
                <p className="text-[10.5px]" style={{ color: 'var(--rc-ink-4)' }}>
                  A plan prescribing hills you cannot reach is a plan you will not run. Say what you have.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Recent race or time trial</label>
                <input
                  type="text"
                  value={recentRaceResult}
                  onChange={e => setRecentRaceResult(e.target.value)}
                  placeholder="e.g. ran 10K in 52:00 three weeks ago"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Current weekly km <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--rc-ink-4)' }}>(auto-computed from last 90 days if blank)</span></label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeeklyKm}
                  onChange={e => setCurrentWeeklyKm(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>What should this plan address?</label>
                <textarea
                  value={addressesWhat}
                  onChange={e => setAddressesWhat(e.target.value)}
                  placeholder="e.g. carry the 80/20 discipline forward from the last block, lift threshold pace by 10s/km, build long-run capacity to 18km"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="rc-mono text-[10.5px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Limitations to respect</label>
                <textarea
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  placeholder="e.g. evenings only Mon/Wed/Fri, plantar fasciitis history — no double sessions, no quality on Friday before long run"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                  style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="rc-mono text-[11px] font-medium uppercase" style={{ color: 'var(--rc-ink-3)', letterSpacing: '0.08em' }}>Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else the coach should know..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
                style={{ background: 'var(--rc-surface-2)', border: '1px solid var(--rc-line)', color: 'var(--rc-ink)' }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!planType || generating}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'var(--rc-blue)', color: '#fff' }}
            >
              <Sparkles className="w-4 h-4" />
              {generating ? (build?.label ? `${build.label}…` : 'Starting…') : 'Generate Plan'}
            </button>

            {build && (generating || build.stage === 'failed') && <PlanBuildProgress build={build} />}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
