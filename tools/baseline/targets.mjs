// @ts-check

/**
 * One capture of the plain (world-off) site.
 * @typedef {object} Target
 * @property {string} id File-safe name: `<page>[-door-<a|b>][-reduced]-<viewport>`.
 * @property {string} path The page's path.
 * @property {'desktop' | 'phone'} viewport
 * @property {'a' | 'b' | null} door The home's door chosen for the visit, or none.
 * @property {boolean} reducedMotion Whether the browser asks for reduced motion.
 */

/** The two viewports a capture uses. */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900, touch: false },
  phone: { width: 390, height: 844, touch: true },
};

/** @type {Array<'desktop' | 'phone'>} */
const VIEWPORT_NAMES = ['desktop', 'phone'];

/**
 * The name a page has in a file name: `/` is `home`, `/products/underfire-ai` is `products-underfire-ai`.
 * @param {string} path
 * @returns {string}
 */
function pageName(path) {
  const slug = path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'home' : slug;
}

/**
 * The captures that make the baseline: every sitemap page at both viewports, the home again behind
 * each door, and the home behind door a with reduced motion. Every one is plain (the world is off),
 * which the capture tool sets for each visit, so a target carries no world flag.
 * @param {string[]} paths The sitemap's paths; the home is `/`.
 * @returns {Target[]}
 */
export function baselineTargets(paths) {
  /** @type {Target[]} */
  const targets = [];
  /**
   * @param {string} path
   * @param {'a' | 'b' | null} door
   * @param {boolean} reducedMotion
   */
  const add = (path, door, reducedMotion) => {
    for (const viewport of VIEWPORT_NAMES) {
      const parts = [pageName(path)];
      if (door) parts.push('door', door);
      if (reducedMotion) parts.push('reduced');
      parts.push(viewport);
      targets.push({ id: parts.join('-'), path, viewport, door, reducedMotion });
    }
  };
  for (const path of paths) add(path, null, false);
  add('/', 'a', false);
  add('/', 'b', false);
  add('/', 'a', true);
  return targets;
}
