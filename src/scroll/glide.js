// @ts-check

/**
 * One way to move the page to a point: through Lenis when the scroll engine is running (so smooth
 * scrolling is not fought), otherwise the browser's own scroll. The engine registers itself here.
 */

/** @type {((y: number, instant: boolean) => void) | null} */
let glider = null;

/**
 * Called by ScrollEngine with its Lenis-driven scroll, and with null when it stops.
 * @param {((y: number, instant: boolean) => void) | null} next
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
  if (glider) glider(y, instant);
  if (instant) {
    // 'instant', not 'auto': the stylesheet sets `scroll-behavior: smooth`, which 'auto' follows. A
    // smooth jump to the top of a new page is cut short on phones as the page lays out, and left
    // visitors at the bottom (Chris, 2026-11-09).
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    return;
  }
  if (!glider) window.scrollTo({ top: y, behavior: 'smooth' });
}
