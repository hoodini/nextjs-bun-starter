import { describe, expect, it } from 'bun:test';
import { formatSeasonIntake, intakeFromRequest } from './season-intake';

describe('season intake', () => {
  it('says nothing when only the race was given', () => {
    expect(formatSeasonIntake({})).toBe('');
    expect(intakeFromRequest({})).toBeNull();
  });

  it('renders target time and limitations, and tells the coach to honour them', () => {
    const t = formatSeasonIntake({ targetTime: '3:15', limitations: 'No running Tuesdays; plantar fasciitis left foot' });
    expect(t).toContain('Target time: 3:15');
    expect(t).toContain('Limitations to respect: No running Tuesdays');
    expect(t).toMatch(/Honour every limitation/);
  });

  it('a revision carries the old season and the requested change', () => {
    const t = formatSeasonIntake({ previousSeasonText: 'P1 Base · 8 wk', changeRequest: 'Shorter base, more climbing earlier' });
    expect(t).toContain('REVISION');
    expect(t).toContain('P1 Base · 8 wk');
    expect(t).toContain('Shorter base, more climbing earlier');
  });

  it('stores only what was given, never the server-side previous season', () => {
    const i = intakeFromRequest({ targetTime: '3:15', previousSeasonText: 'x', currentWeeklyKm: 30 });
    expect(i).toEqual({ targetTime: '3:15', currentWeeklyKm: 30 });
  });
});
