// @ts-check
import { join } from 'node:path';

/**
 * The local date as YYYY-MM-DD.
 * @param {Date} date
 * @returns {string}
 */
export function localDate(date) {
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Where a run writes: `baseline-captures/<date>` at the repo root. Not under `test-results/`,
 * which Playwright empties at the start of every run.
 * @param {string} root The repo root.
 * @param {Date} date When the run started.
 * @returns {string}
 */
export function captureDir(root, date) {
  return join(root, 'baseline-captures', localDate(date));
}
