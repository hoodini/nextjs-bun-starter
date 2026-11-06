import { describe, expect, it } from 'bun:test';
import { selectLastQuiet, selectPendingProposal } from './proposal-select';

const row = (status: string, plan_id: string | null, created_at: string) => ({ status, plan_id, created_at });

describe('selectPendingProposal', () => {
  it('ignores a pending row written while no plan was active', () => {
    const rows = [row('pending', null, '2026-10-03T18:00:00Z')];
    expect(selectPendingProposal(rows, 'new-plan')).toBeNull();
  });

  it('ignores a pending row written for a previous plan', () => {
    expect(selectPendingProposal([row('pending', 'old', '2026-11-01T00:00:00Z')], 'new')).toBeNull();
  });

  it('a newer weekly result supersedes an older pending one', () => {
    const rows = [row('pending', 'p', '2026-11-07T18:00:00Z'), row('no_change', 'p', '2026-11-14T18:00:00Z')];
    expect(selectPendingProposal(rows, 'p')).toBeNull();
    expect(selectLastQuiet(rows, 'p')?.status).toBe('no_change');
  });

  it('returns the newest pending row for the active plan', () => {
    const rows = [row('no_change', 'p', '2026-11-07T18:00:00Z'), row('pending', 'p', '2026-11-14T18:00:00Z')];
    expect(selectPendingProposal(rows, 'p')?.created_at).toBe('2026-11-14T18:00:00Z');
  });

  it('nothing without an active plan', () => {
    expect(selectPendingProposal([row('pending', 'p', '2026-11-14T18:00:00Z')], null)).toBeNull();
    expect(selectLastQuiet([row('no_change', null, '2026-11-14T18:00:00Z')], null)).toBeNull();
  });
});
