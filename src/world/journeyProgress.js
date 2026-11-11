// @ts-check

/**
 * How far through the home page's journey section the visitor has scrolled, 0..1: 0 when its top
 * is at the top of the screen, 1 when its bottom reaches the bottom (Code World W1.3).
 * @returns {number}
 */
export function journeyProgress() {
  const journey = document.querySelector('[data-world-journey]');
  if (!(journey instanceof HTMLElement)) return 0;
  const rect = journey.getBoundingClientRect();
  const span = rect.height - window.innerHeight;
  return span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
}
