// @ts-check

/**
 * Source for the Immersive Web Experiences chapter: this site's own drive between pages, the
 * easing that speeds the Code World up and slows it back down. Approved by Chris (2026-11-27).
 * @type {import('./index.js').Excerpt}
 */
const serviceImmersive = {
  id: 'service-immersive',
  file: 'drive.js',
  repo: 'cja86104/AllenCode',
  path: 'src/world/drive.js',
  lines: [28, 39],
  commit: 'dee2b316c1b75bb6045b4147221f77c250a11fbc',
  code: [
    "export function driveAt(elapsed) {",
    "  if (!(elapsed >= 0) || elapsed >= DRIVE_MS) return null;",
    "  const half = DRIVE_MS / 2;",
    "  if (elapsed < half) {",
    "    const u = elapsed / half;",
    "    // Speeding up: the distance grows as u², so the speed at the swap is 2 · DRIVE_DISTANCE per half.",
    "    return { half: 'out', u, travel: DRIVE_DISTANCE * u * u, alpha: 1 - smooth(u) };",
    "  }",
    "  const u = (elapsed - half) / half;",
    "  // Slowing down to the start, from the same speed.",
    "  return { half: 'in', u, travel: -DRIVE_DISTANCE * (1 - u) * (1 - u), alpha: smooth(u) };",
    "}",
  ].join('\n'),
  becomes: 'the drive between pages in this site’s Code World',
  approved: { by: 'Chris', on: '2026-11-27' },
};

export default serviceImmersive;
