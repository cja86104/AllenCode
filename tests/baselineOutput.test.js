/** @vitest-environment node */
// @ts-check
import { describe, expect, it } from 'vitest';
import { captureDir, localDate } from '../tools/baseline/output.mjs';

describe('baseline output folder', () => {
  it('formats the local date as YYYY-MM-DD with zero padding', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDate(new Date(2026, 10, 27, 0, 1))).toBe('2026-11-27');
  });

  it('puts a run in baseline-captures/<date> at the repo root, outside test-results', () => {
    const dir = captureDir('/repo', new Date(2026, 10, 27));
    expect(dir).toMatch(/[\\/]repo[\\/]baseline-captures[\\/]2026-11-27$/);
    expect(dir).not.toContain('test-results');
  });
});
