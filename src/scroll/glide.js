// @ts-check

/**
 * One way to move the page to a point: through Lenis when the scroll engine is running (so smooth
 * scrolling is not fought), otherwise the browser's own scroll. The engine registers itself here.
 */

/** @type {((y: number) => void) | null} */
let glider = null;

/**
 * Called by ScrollEngine with its Lenis-driven scroll, and with null when it stops.
 * @param {((y: number) => void) | null} next
 */
export function setGlider(next) {
  glider = next;
}

/**
 * Glides the page so `y` (a document offset in CSS pixels) is at the top of the screen.
 * @param {number} y
 * @param {{ instant?: boolean }} [opts] `instant` jumps without animation (reduced motion).
 */
export function glideTo(y, { instant = false } = {}) {
  if (!instant && glider) {
    glider(y);
    return;
  }
  window.scrollTo({ top: y, behavior: instant ? 'auto' : 'smooth' });
}
