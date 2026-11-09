// @ts-check

/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** Section progress before the code lifts, and the share of the section the flight takes. */
const FLIGHT_FROM = 0.15;
const FLIGHT_SPAN = 0.7;
/** Share of the flight after which the real screen takes over. */
const HANDOFF_FROM = 0.88;

/**
 * Where a service chapter is for a given scroll progress through its section (0 to 1).
 * @param {number} progress
 * @returns {{ flight: number, handoff: number }} Progress of the code-to-screen flight, and the
 *   opacity of the real screen.
 */
export function chapterTimeline(progress) {
  const flight = clamp01((clamp01(progress) - FLIGHT_FROM) / FLIGHT_SPAN);
  return { flight, handoff: clamp01((flight - HANDOFF_FROM) / (1 - HANDOFF_FROM)) };
}

/**
 * How many lines of the audit chapter's code have been checked: none before 10 percent of the
 * section, all of them by 90 percent.
 * @param {number} progress
 * @param {number} lineCount
 * @returns {number}
 */
export function auditTimeline(progress, lineCount) {
  return Math.round(clamp01((progress - 0.1) / 0.8) * lineCount);
}
