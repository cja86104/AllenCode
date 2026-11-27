// @ts-check

/**
 * Where the rail draws each stop's mark for a fine pointer, in pixels down a line `length` long: at its
 * share of the journey, eased apart where stops crowd (the opening's sit a few pixels apart) so each
 * mark is at least `gap` from the next (a 24 px target, WCAG 2.2), in order and within the line; on a
 * line too short for that, shared evenly along it (2026-11-26).
 * @param {ReadonlyArray<number>} froms Shares of the journey, in order.
 * @param {number} length
 * @param {number} gap
 * @returns {number[]}
 */
export function spreadMarks(froms, length, gap) {
  const n = froms.length;
  if (n === 0) return [];
  if (n === 1) return [Math.min(length, Math.max(0, froms[0] * length))];
  if (gap * (n - 1) >= length) return froms.map((_, i) => (length * i) / (n - 1));
  const marks = froms.map((from) => Math.min(length, Math.max(0, from * length)));
  // Down the line, each at least a gap past the one before; then back up it, each at least a gap
  // before the one after and never past the line's end.
  for (let i = 1; i < n; i += 1) marks[i] = Math.max(marks[i], marks[i - 1] + gap);
  marks[n - 1] = Math.min(marks[n - 1], length);
  for (let i = n - 2; i >= 0; i -= 1) marks[i] = Math.min(marks[i], marks[i + 1] - gap);
  return marks;
}
