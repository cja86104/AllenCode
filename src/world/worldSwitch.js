// @ts-check
import { useEffect, useSyncExternalStore } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useHydrated } from '../ssr/useHydrated.js';
import { supportsWebGL2, usePrefersReducedMotion } from '../field/environment.js';
import { products } from '../data/products.js';

/** Where the session remembers that the world is switched on (Code World W1.3). */
export const WORLD_STORAGE_KEY = 'allencode:world';

/**
 * Whether the world is switched on (on by default since W6, Chris 2026-11-17: "Everyone now"): never
 * before the page has hydrated (the prebuilt HTML never depends on it); `?world=0` off and `?world=1`
 * on; otherwise on unless this visit turned it off (the plain-view toggle, or an earlier `?world=0`).
 * @param {{ hydrated: boolean, flag: string | null, stored: string | null }} state
 */
export function worldModeFrom({ hydrated, flag, stored }) {
  if (!hydrated) return false;
  if (flag === '1') return true;
  if (flag === '0') return false;
  return stored !== '0';
}

/** The visit's choice when storage is blocked: kept for the page's life instead. @type {string | null} */
let remembered = null;
/** @type {Set<() => void>} */
const preferenceListeners = new Set();

/** @returns {string | null} */
function readStored() {
  try {
    return window.sessionStorage.getItem(WORLD_STORAGE_KEY);
  } catch {
    return remembered;
  }
}

/** Keeps the visit's choice ('0' off, '1' on) and tells whoever reads it. @param {'0' | '1'} value */
function store(value) {
  remembered = value;
  try {
    window.sessionStorage.setItem(WORLD_STORAGE_KEY, value);
  } catch {
    // Storage is blocked: the choice lasts as long as the page.
  }
  preferenceListeners.forEach((listener) => listener());
}

/** @param {() => void} listener */
const subscribePreference = (listener) => {
  preferenceListeners.add(listener);
  return () => preferenceListeners.delete(listener);
};

/**
 * Turns the plain view on (the world off) or off, for the visit (the footer's and phone menu's
 * toggle, W6). The page changes at once.
 * @param {boolean} plain
 */
export function setPlainView(plain) {
  store(plain ? '0' : '1');
}

/** Whether this visit has turned the world off. @returns {boolean} */
export function usePlainView() {
  return useSyncExternalStore(subscribePreference, () => readStored() === '0', () => false);
}

/**
 * The switch for the Code World, on by default, kept for the visit: `?world=0` and `?world=1` are
 * remembered, so the way back from another page keeps them.
 * @returns {boolean}
 */
export function useWorldMode() {
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();
  const flag = searchParams.get('world');
  const stored = useSyncExternalStore(subscribePreference, readStored, () => null);
  useEffect(() => {
    if (flag === '1' || flag === '0') store(flag);
  }, [flag]);
  return worldModeFrom({ hydrated, flag, stored: hydrated ? stored : null });
}

/** Set once the world cannot run on this page load (no WebGL2 after all, a lost context). */
let failed = false;
/** @type {Set<() => void>} */
const listeners = new Set();

/** The world calls this when it cannot run; the home page goes back to today's. */
export function markWorldFailed() {
  if (failed) return;
  failed = true;
  listeners.forEach((listener) => listener());
}

/** @param {() => void} listener */
const subscribeFailure = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The inner pages with a stretch of road (Code World W5a; `stretches.js` says what each shows). */
const STRETCH_PAGES = new Set(['/products', '/services', '/templates', '/about', '/contact', ...products.map((p) => `/products/${p.slug}`)]);

/**
 * Which page of the world a path is, with the world on (Code World W5a): the home page's journey, or
 * an inner page's stretch: every page but the home has one since W7 (2026-11-17), checkout success and
 * the 404 page (any unknown address) included; none for an unknown product, which goes on to Products.
 * @param {{ on: boolean, pathname: string }} state
 * @returns {'home' | 'stretch' | null}
 */
export function worldPageFrom({ on, pathname }) {
  if (!on) return null;
  if (pathname === '/') return 'home';
  const path = pathname.replace(/\/+$/, '');
  if (STRETCH_PAGES.has(path)) return 'stretch';
  return /^\/products\/[^/]+$/.test(path) ? null : 'stretch';
}

/**
 * Which page of the world this is right now (`worldPageFrom`), with the world on when the switch is
 * on, the browser has WebGL2, the visitor has not asked for reduced motion, and the world has not
 * failed. Read by the shell: which layer to mount, and whether the page opens on a stretch.
 * @returns {'home' | 'stretch' | null}
 */
export function useWorldPage() {
  const switchedOn = useWorldMode();
  const { pathname } = useLocation();
  const capable = useWorldCapable();
  return worldPageFrom({ on: switchedOn && capable, pathname });
}

/** WebGL2, probed once for the page; the probe's own context is released at once (environment.js). @type {boolean | undefined} */
let webgl2;

/**
 * Whether the world can run here: the browser has WebGL2, the visitor has not asked for reduced
 * motion, and the world has not failed on this page load. False before hydration, so the prebuilt
 * HTML never depends on it.
 * @returns {boolean}
 */
export function useWorldCapable() {
  const hydrated = useHydrated();
  const reducedMotion = usePrefersReducedMotion();
  const worldFailed = useSyncExternalStore(subscribeFailure, () => failed, () => false);
  if (!hydrated) return false;
  webgl2 ??= supportsWebGL2();
  return webgl2 && !reducedMotion && !worldFailed;
}

/**
 * Whether the home page is the Code World journey right now (the home page reads it to choose its top).
 * @returns {boolean}
 */
export function useWorldHome() {
  return useWorldPage() === 'home';
}
