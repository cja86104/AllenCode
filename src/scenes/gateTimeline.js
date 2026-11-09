// @ts-check

/** Section progress by which the whole file has been typed. */
const TYPED_BY = 0.35;
/** Section progress at which the characters start to lift. */
const FLIGHT_FROM = 0.4;
/** Share of the flight after which the real headline takes over. */
const HANDOFF_FROM = 0.88;
/** Section progress by which the approved gate line has faded. */
const INTRO_UNTIL = 0.06;

/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * Where the gate is for a given scroll progress through its section (0 to 1).
 *
 * @param {number} progress
 * @returns {{ typed: number, flight: number, handoff: number, intro: number }} Each 0 to 1:
 *   share of the file typed, progress of the code-to-headline flight, opacity of the real headline,
 *   and opacity of the approved gate line.
 */
export function gateTimeline(progress) {
  const p = clamp01(progress);
  const flight = clamp01((p - FLIGHT_FROM) / (1 - FLIGHT_FROM));
  return {
    typed: clamp01(p / TYPED_BY),
    flight,
    handoff: clamp01((flight - HANDOFF_FROM) / (1 - HANDOFF_FROM)),
    intro: 1 - clamp01(p / INTRO_UNTIL),
  };
}
