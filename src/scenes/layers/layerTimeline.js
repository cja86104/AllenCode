// @ts-check
import { chapterTimeline } from '../chapterTimeline.js';

/** @typedef {'source' | 'transformation' | 'result'} StepId */

/**
 * C's three steps (Living Source Phase 4): their number, label (`short` on a phone) and the point in a
 * chapter's scroll a step button moves to.
 * @type {ReadonlyArray<{ id: StepId, n: string, label: string, short: string, at: number }>}
 */
export const STEPS = Object.freeze([
  { id: 'source', n: '01', label: 'Source', short: 'Source', at: 0.05 },
  { id: 'transformation', n: '02', label: 'Transformation', short: 'Flight', at: 0.4 },
  { id: 'result', n: '03', label: 'Result', short: 'Result', at: 0.92 },
]);

/** @param {StepId} step @returns {number} */
export function stepAt(step) {
  return STEPS.find((s) => s.id === step)?.at ?? 0;
}

/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * Where a chapter's layer stack is for its scroll progress (0 to 1), on today's flight timing
 * (`chapterTimeline`): the source while the code holds; pulled apart over the first quarter of the travel
 * while its characters fly; settling flat and face-on as the real screen takes over (the handoff), so the
 * result is read straight.
 * @param {number} progress
 * @returns {{ step: StepId, travel: number, apart: number, tilt: number, codeOpacity: number, glyphOpacity: number,
 *   screenOpacity: number, landed: boolean }}
 */
export function layerTimeline(progress) {
  const { flight: travel, handoff } = chapterTimeline(progress);
  return {
    step: handoff > 0 ? 'result' : travel > 0 ? 'transformation' : 'source',
    travel,
    apart: clamp01(travel / 0.25),
    tilt: 1 - handoff,
    codeOpacity: 1 - clamp01(travel / 0.3),
    glyphOpacity: Math.min(clamp01(travel / 0.1), 1 - handoff),
    screenOpacity: 0.35 + 0.65 * travel,
    landed: handoff >= 1,
  };
}
