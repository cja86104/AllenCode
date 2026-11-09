// @ts-check
/** @typedef {import('./types.js').CapabilityEnv} CapabilityEnv */
/** @typedef {import('./types.js').Capabilities} Capabilities */
/** @typedef {import('./types.js').Tier} Tier */

/** Ambient characters per tier. Starting values, tuned by measurement in BLUEPRINT Task 2.2. */
export const AMBIENT_COUNTS = Object.freeze({ high: 3500, medium: 1800, low: 700 });

/** Most particles one transformation may use per tier. Tuned with the ambient counts. */
export const TRANSFORM_BUDGETS = Object.freeze({ high: 4000, medium: 2500, low: 1200 });

const PHONE_MAX_WIDTH = 768;
const LOW_CORE_LIMIT = 4;
const LOW_MEMORY_GB = 4;

/**
 * @param {CapabilityEnv} env
 * @returns {Tier}
 */
function tierFor(env) {
  if (env.viewportWidth < PHONE_MAX_WIDTH || env.hardwareConcurrency <= LOW_CORE_LIMIT) return 'low';
  if (env.deviceMemory !== undefined && env.deviceMemory <= LOW_MEMORY_GB) return 'medium';
  return 'high';
}

/**
 * Decides how much of the field this device should draw. Pure: the caller reads the browser.
 *
 * @param {CapabilityEnv} env
 * @returns {Capabilities}
 */
export function detectCapabilities(env) {
  const tier = tierFor(env);
  return {
    webgl2: env.webgl2,
    reducedMotion: env.prefersReducedMotion,
    tier,
    ambientCount: AMBIENT_COUNTS[tier],
    transformBudget: TRANSFORM_BUDGETS[tier],
  };
}
