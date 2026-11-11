// @ts-check

/** A gap longer than this is a paused or hidden page, not a slow frame. */
const PAUSE_MS = 250;
/** The most intervals kept (the latest win), about half a minute at 60 frames a second. */
const KEEP = 2000;

/**
 * Records the time between animation frames and reports the median and the 95th percentile: the
 * prototype's go/no-go numbers on Chris's phone (Task P5).
 * @returns {{ tick: (now: number) => void, report: () => { frames: number, medianMs: number, p95Ms: number }, reset: () => void }}
 */
export function createFrameMeter() {
  /** @type {number[]} */
  let intervals = [];
  /** @type {number | null} */
  let last = null;

  /** @param {number[]} sorted @param {number} q */
  const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)];

  return {
    tick(now) {
      if (last !== null) {
        const gap = now - last;
        if (gap > 0 && gap <= PAUSE_MS) {
          intervals.push(gap);
          if (intervals.length > KEEP) intervals = intervals.slice(-KEEP);
        }
      }
      last = now;
    },
    report() {
      if (intervals.length === 0) return { frames: 0, medianMs: 0, p95Ms: 0 };
      const sorted = [...intervals].sort((a, b) => a - b);
      return { frames: sorted.length, medianMs: quantile(sorted, 0.5), p95Ms: quantile(sorted, 0.95) };
    },
    reset() {
      intervals = [];
      last = null;
    },
  };
}
