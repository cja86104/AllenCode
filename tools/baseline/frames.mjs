// @ts-check

/**
 * The scroll positions a capture takes a viewport-sized frame at: the top, then every viewport
 * height down the page, then the bottom (never twice).
 * @param {number} pageHeight The document's scroll height.
 * @param {number} viewportHeight The window's inner height.
 * @returns {number[]}
 */
export function frameOffsets(pageHeight, viewportHeight) {
  const bottom = Math.max(0, pageHeight - viewportHeight);
  /** @type {number[]} */
  const offsets = [];
  for (let y = 0; y < bottom; y += viewportHeight) offsets.push(y);
  offsets.push(bottom);
  return offsets;
}
