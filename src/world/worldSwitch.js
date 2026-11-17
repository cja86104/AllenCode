// @ts-check
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useHydrated } from '../ssr/useHydrated.js';
import { supportsWebGL2, usePrefersReducedMotion } from '../field/environment.js';
import { products } from '../data/products.js';

/** Where the session remembers that the world is switched on (Code World W1.3). */
export const WORLD_STORAGE_KEY = 'allencode:world';

/**
 * Whether the world is switched on: never before the page has hydrated (the prebuilt HTML never
 * depends on it); `?world=1` on, `?world=0` off, otherwise what the session remembers.
 * @param {{ hydrated: boolean, flag: string | null, stored: string | null }} state
 */
export function worldModeFrom({ hydrated, flag, stored }) {
  if (!hydrated) return false;
  if (flag === '1') return true;
  if (flag === '0') return false;
  return stored === '1';
}

/** @returns {string | null} */
function readStored() {
  try {
    return window.sessionStorage.getItem(WORLD_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * The switch for the Code World on the home page (`/?world=1`), kept for the session so the way
 * back from an inner page keeps it. Blocked storage simply forgets it.
 * @returns {boolean}
 */
export function useWorldMode() {
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();
  const flag = searchParams.get('world');
  useEffect(() => {
    try {
      if (flag === '1') window.sessionStorage.setItem(WORLD_STORAGE_KEY, '1');
      else if (flag === '0') window.sessionStorage.removeItem(WORLD_STORAGE_KEY);
    } catch {
      // Storage is blocked: the switch applies to this address only.
    }
  }, [flag]);
  return worldModeFrom({ hydrated, flag, stored: hydrated ? readStored() : null });
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
 * Which page of the world a path is, with the world on (Code World W5a): the home page's journey,
 * an inner page's stretch, or none (checkout success, an unknown page, the lab): those keep the field.
 * @param {{ on: boolean, pathname: string }} state
 * @returns {'home' | 'stretch' | null}
 */
export function worldPageFrom({ on, pathname }) {
  if (!on) return null;
  if (pathname === '/') return 'home';
  return STRETCH_PAGES.has(pathname.replace(/\/+$/, '')) ? 'stretch' : null;
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
  const reducedMotion = usePrefersReducedMotion();
  const worldFailed = useSyncExternalStore(subscribeFailure, () => failed, () => false);
  // Probed once; the probe's own context is released at once (environment.js).
  const [webgl2] = useState(() => typeof document !== 'undefined' && supportsWebGL2());
  return worldPageFrom({ on: switchedOn && webgl2 && !reducedMotion && !worldFailed, pathname });
}

/**
 * Whether the home page is the Code World journey right now (the home page reads it to choose its top).
 * @returns {boolean}
 */
export function useWorldHome() {
  return useWorldPage() === 'home';
}
