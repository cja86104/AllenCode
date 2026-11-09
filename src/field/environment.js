// @ts-check
import { useSyncExternalStore } from 'react';

/** @typedef {import('./types.js').CapabilityEnv} CapabilityEnv */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether this browser can create a WebGL2 context. The probe context is released immediately.
 * @returns {boolean}
 */
export function supportsWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** @returns {boolean} */
function readReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Reads the browser facts that `detectCapabilities` decides from.
 * @returns {CapabilityEnv}
 */
export function readCapabilityEnv() {
  /** @type {Navigator & { deviceMemory?: number }} */
  const nav = navigator;
  return {
    webgl2: supportsWebGL2(),
    prefersReducedMotion: readReducedMotion(),
    hardwareConcurrency: nav.hardwareConcurrency || 1,
    deviceMemory: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    viewportWidth: window.innerWidth,
  };
}

/**
 * @param {() => void} onChange
 * @returns {() => void}
 */
function subscribeReducedMotion(onChange) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * Live `prefers-reduced-motion` value that updates when the visitor changes the setting.
 * @returns {boolean}
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
}
