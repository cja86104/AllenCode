// @ts-check

/**
 * The prototype journey's stops and where each begins and ends in the scroll (0 to 1), in order
 * (docs/superpowers/plans/2026-11-10-code-world-prototype.md). They match the camera's stops
 * (`CAMERA_KEYS` in camera.js): the fork's label holds while the camera turns onto the business road.
 * @type {ReadonlyArray<{ name: string, text: string, from: number, to: number }>}
 */
export const STOPS = Object.freeze([
  { name: 'Empty file', text: 'Every project starts here: this site’s own entry point, typing itself in.', from: 0, to: 0.15 },
  { name: 'Into the code', text: 'Step through the file. Its characters become the world.', from: 0.15, to: 0.3 },
  { name: 'The road', text: 'A road made of this site’s code, running into the dark.', from: 0.3, to: 0.55 },
  { name: 'The fork', text: 'business/ for a product or a company. family/ for a site of your own.', from: 0.55, to: 0.8 },
  { name: 'First landmark', text: 'UnderFire AI: its own code becomes its real screen.', from: 0.8, to: 1 },
].map((stop) => Object.freeze(stop)));

/**
 * The stop at a scroll progress (clamped to 0..1).
 * @param {number} progress
 */
export function stopAt(progress) {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return STOPS.find((stop) => p < stop.to) ?? STOPS[STOPS.length - 1];
}
