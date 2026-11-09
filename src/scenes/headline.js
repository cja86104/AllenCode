// @ts-check

/** The approved headline (spec section 4), split where it breaks on screen. */
export const HEADLINE_LINES = Object.freeze(['We build software', 'that ships.']);
export const HEADLINE_TEXT = HEADLINE_LINES.join(' ');

/** The canvas and the DOM headline share these so the handoff does not jump. */
export const HEADLINE_VW_DIVISOR = 8.5;
export const HEADLINE_VH_DIVISOR = 4.2;
export const HEADLINE_LINE_HEIGHT = 1.1;
/** CSS font size matching `headlineLayout`'s `fontPx`. */
export const HEADLINE_FONT_SIZE_CSS = `min(calc(100vw / ${HEADLINE_VW_DIVISOR}), calc(100vh / ${HEADLINE_VH_DIVISOR}))`;
export const HEADLINE_COLOR = /** @type {[number, number, number]} */ ([0.96, 0.96, 0.95]);

/**
 * Where the headline sits in a viewport, for the transformation's landing text.
 *
 * @param {number} width Viewport width in CSS pixels.
 * @param {number} height Viewport height in CSS pixels.
 * @returns {{ fontPx: number, targetBox: import('../field/types.js').Box, step: number }}
 */
export function headlineLayout(width, height) {
  const fontPx = Math.min(width / HEADLINE_VW_DIVISOR, height / HEADLINE_VH_DIVISOR);
  const blockHeight = fontPx * HEADLINE_LINE_HEIGHT * HEADLINE_LINES.length;
  return {
    fontPx,
    targetBox: { x: width * 0.04, y: (height - blockHeight) / 2, w: width * 0.92, h: blockHeight },
    step: Math.max(6, Math.round(fontPx / 14)),
  };
}
