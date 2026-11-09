// @ts-check
/** @typedef {import('./types.js').Governor} Governor */

const WINDOW = 24;
const SLOW_MS = 22;
const FAST_MS = 14;
const CUT = 0.15;
const RESTORE = 0.05;
const FLOOR = 0.4;

/**
 * Adapts the ambient character count to the measured frame rate. Every 24 valid samples it compares the
 * average frame time with the thresholds: slower than 22 ms cuts the count by 15 percent,
 * faster than 14 ms restores 5 percent of the base, clamped to 40 percent of the base through
 * the base. Non-finite and negative samples are ignored.
 *
 * @param {{ base: number }} opts
 * @returns {Governor}
 */
export function createGovernor({ base }) {
  const floor = Math.round(base * FLOOR);
  let count = base;
  let total = 0;
  let samples = 0;

  return {
    sample(frameMs) {
      if (!Number.isFinite(frameMs) || frameMs < 0) return count;
      total += frameMs;
      samples += 1;
      if (samples < WINDOW) return count;

      const average = total / samples;
      total = 0;
      samples = 0;
      if (average > SLOW_MS) count = Math.max(floor, Math.round(count * (1 - CUT)));
      else if (average < FAST_MS) count = Math.min(base, Math.round(count + base * RESTORE));
      return count;
    },
  };
}
