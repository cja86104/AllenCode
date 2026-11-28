// @ts-check
import { glideTo } from '../scroll/glide.js';
import { findFile } from './tree.js';

/** @typedef {import('../door/doorStorage.js').Door} Door */
/** @typedef {import('./tree.js').PathTarget} PathTarget */
/**
 * What going somewhere needs from the page: where it is, how to route, the door and its setter, and whether
 * the visitor asked for reduced motion.
 * @typedef {{ pathname: string, navigate: (to: string) => void, door: Door | null, setDoor: (door: Door) => void, reducedMotion: boolean }} GoContext
 */

/** How often a wait looks again, in ms. */
const POLL_MS = 50;
/** How long a glide may take before focus moves anyway, in ms (a page that cannot scroll that far). */
const ARRIVE_MS = 1500;

/** @param {Element} el The element's top in document px. */
const documentTop = (el) => el.getBoundingClientRect().top + window.scrollY;

/** The fixed header's bottom, in px from the top of the window. */
const headerBottom = () => document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;

/**
 * Where a glide to `el` stops: a pinned section (a direct `.pin-frame` child) at its top, so its frame fills
 * the screen; anything else at its top less the header, so its heading is never under the bar. Never above
 * the page, rounded up to a whole pixel.
 * @param {Element} el
 * @param {number} header The header's bottom, in px.
 * @returns {number}
 */
export function landingY(el, header) {
  const pinned = el.querySelector(':scope > .pin-frame') !== null;
  return Math.max(0, Math.ceil(documentTop(el) - (pinned ? 0 : header)));
}

/**
 * Where a glide stops for segment `index` of a pinned chapter of `count` (door B's templates): a pixel inside
 * it, as `useSectionProgress` counts the section's scroll.
 * @param {number} sectionTop @param {number} sectionHeight @param {number} viewportH @param {number} index @param {number} count
 * @returns {number}
 */
export function templateSegmentY(sectionTop, sectionHeight, viewportH, index, count) {
  return Math.ceil(sectionTop + (index * (sectionHeight - viewportH)) / count) + 1;
}

/**
 * The first element matching `selector`, as soon as it is in the page (the home page and a door's chapters
 * arrive after a route or a door changes), or null after `timeoutMs`.
 * @param {string} selector
 * @param {number} [timeoutMs]
 * @returns {Promise<Element | null>}
 */
export function waitForElement(selector, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const look = () => {
      const el = document.querySelector(selector);
      if (el) resolve(el);
      else if (Date.now() - started >= timeoutMs) resolve(null);
      else setTimeout(look, POLL_MS);
    };
    look();
  });
}

/**
 * Moves focus to the place gone to: its first heading (or it), made focusable, without scrolling.
 * @param {Element} el
 */
export function focusHeading(el) {
  const heading = el.querySelector('h1, h2, h3') ?? el;
  if (!(heading instanceof HTMLElement)) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

/** Resolves once the page is within 2 px of `y`, or after ARRIVE_MS. @param {number} y @returns {Promise<void>} */
function arrival(y) {
  return new Promise((resolve) => {
    const started = Date.now();
    const look = () => {
      if (Math.abs(window.scrollY - y) <= 2 || Date.now() - started >= ARRIVE_MS) resolve();
      else setTimeout(look, POLL_MS);
    };
    look();
  });
}

/**
 * Goes to one target: routes to its page if the visitor is elsewhere, waits for its element, glides there
 * (at once under reduced motion) and, once arrived, moves focus to its heading. False if it never appeared.
 * @param {PathTarget} target @param {GoContext} ctx
 * @returns {Promise<boolean>}
 */
async function reach(target, ctx) {
  const path = target.kind === 'home' ? '/' : target.path;
  if (ctx.pathname !== path) ctx.navigate(path);
  if (!target.selector) return true;
  // Door B's pinned template chapter draws only the segment on screen; it names its order instead.
  const pinnedTemplates = target.kind === 'home' && target.template ? ', [data-template-order]' : '';
  const el = await waitForElement(`${target.selector}${pinnedTemplates}`);
  if (!el) return false;
  if (target.kind === 'home' && target.template && el.matches('[data-template-order]')) {
    const order = (el.getAttribute('data-template-order') ?? '').split(' ');
    const index = order.indexOf(target.template);
    if (index < 0) return false;
    const y = templateSegmentY(documentTop(el), el.getBoundingClientRect().height, window.innerHeight, index, order.length);
    glideTo(y, { instant: ctx.reducedMotion });
    await arrival(y);
    focusHeading((await waitForElement(target.selector, 1000)) ?? el);
    return true;
  }
  const y = landingY(el, headerBottom());
  glideTo(y, { instant: ctx.reducedMotion });
  await arrival(y);
  focusHeading(el);
  return true;
}

/**
 * Goes to a file or a one-file branch chosen from the path bar (Living Source Phase 3): it follows the fork
 * first (a file on the other door's branch switches the door, as the nav's switch does; a branch both doors
 * share, chosen before a door, takes business), then reaches the file; a home chapter that never renders
 * (an excerpt not yet approved) is reached on its fallback page instead.
 * @param {string} id
 * @param {GoContext} ctx
 * @returns {Promise<void>}
 */
export async function goTo(id, ctx) {
  const found = findFile(id);
  if (!found) return;
  const { branch, file } = found;
  const target = file ? file.target : branch?.target;
  if (!target) return;
  if (branch) {
    const door = branch.door ?? ctx.door ?? 'a';
    if (door !== ctx.door) ctx.setDoor(door);
  }
  const reached = await reach(target, ctx);
  if (!reached && file?.fallback) await reach(file.fallback, { ...ctx, pathname: target.kind === 'home' ? '/' : target.path });
}
