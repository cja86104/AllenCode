// @ts-check

/**
 * Readable stops (2026-11-26, Phase 2): at MVP Sprints a flight's characters, on their way from the
 * editor to the screen, crossed the stop's bullet list. While a flight plays at a stop, its characters
 * inside the stop's words' box (`data-world-words`) are drawn at `WORDS_DIM` of their alpha; outside it
 * they are as before, and the road, the ground and the landmarks are not touched. The flights keep their
 * paths.
 */

/** How much of a flying character shows while it is behind the words. */
export const WORDS_DIM = 0.25;
/** The words' box grows by this much each way, in CSS pixels, so a character's edge does not touch them. */
export const WORDS_PAD = 12;
/** No words: a box no point on screen (clip space -1..1) lies inside. */
export const NO_WORDS = Object.freeze(/** @type {[number, number, number, number]} */ ([2, 2, 2, 2]));

/**
 * The words' box in clip space, as the flight's vertex shader tests each character (x0, y0, x1, y1; y
 * up), padded by `WORDS_PAD`; `NO_WORDS` for no box, an empty one or one off screen.
 * @param {{ left: number, top: number, width: number, height: number } | null} rect CSS pixels, as `getBoundingClientRect` gives.
 * @param {{ width: number, height: number }} viewport
 * @returns {readonly [number, number, number, number]}
 */
export function wordsRectNdc(rect, viewport) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return NO_WORDS;
  const left = rect.left - WORDS_PAD;
  const right = rect.left + rect.width + WORDS_PAD;
  const top = rect.top - WORDS_PAD;
  const bottom = rect.top + rect.height + WORDS_PAD;
  if (right <= 0 || bottom <= 0 || left >= viewport.width || top >= viewport.height) return NO_WORDS;
  const x = (/** @type {number} */ px) => (px / viewport.width) * 2 - 1;
  const y = (/** @type {number} */ px) => 1 - (px / viewport.height) * 2;
  return [x(left), y(bottom), x(right), y(top)];
}
