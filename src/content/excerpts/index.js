// @ts-check
import ambient from './ambient.js';
import gate from './gate.js';
import serviceMvp from './service-mvp.js';
import serviceCustom from './service-custom.js';
import serviceAi from './service-ai.js';
import serviceAudit from './service-audit.js';
import productMyTeachersToolbox from './product-my-teachers-toolbox.js';
import productUnderfireAi from './product-underfire-ai.js';
import productFoundersHelm from './product-founders-helm.js';
import productCrewAdvisors from './product-crew-advisors.js';

/**
 * A verbatim excerpt of real source code (spec section 5).
 *
 * @typedef {object} Excerpt
 * @property {string} id
 * @property {string} file File name shown in the editor title bar.
 * @property {string} repo Repository the code comes from, for example `cja86104/AllenCode`.
 * @property {string} path File path inside that repository.
 * @property {[number, number]} lines First and last line of the excerpt, 1-based and inclusive.
 * @property {string} commit Commit the excerpt was copied from.
 * @property {string} code The lines, verbatim, joined with `\n`.
 * @property {string} becomes What the code turns into on the page, for the text alternative.
 * @property {{ by: 'Chris', on: string } | null} approved Chris's approval; null while it is a draft.
 */

const MAX_LINES = 30;
const COMMIT = /^[0-9a-f]{7,40}$/;
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9]{8,}/,
  /sk_live_/,
  /pk_live_/,
  /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/,
  /-----BEGIN [A-Z ]*KEY-----/,
  /AKIA[0-9A-Z]{12,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /\b[A-Z0-9_]*(?:KEY|SECRET|TOKEN)\s*=/,
];

/** @type {Readonly<Record<string, Excerpt>>} */
export const excerpts = Object.freeze({
  [ambient.id]: ambient,
  [gate.id]: gate,
  [serviceMvp.id]: serviceMvp,
  [serviceCustom.id]: serviceCustom,
  [serviceAi.id]: serviceAi,
  [serviceAudit.id]: serviceAudit,
  [productMyTeachersToolbox.id]: productMyTeachersToolbox,
  [productUnderfireAi.id]: productUnderfireAi,
  [productFoundersHelm.id]: productFoundersHelm,
  [productCrewAdvisors.id]: productCrewAdvisors,
});

/**
 * Lists everything wrong with an excerpt; an empty list means it is valid.
 * @param {Excerpt} excerpt
 * @returns {string[]}
 */
export function validateExcerpt(excerpt) {
  /** @type {string[]} */
  const errors = [];
  if (!excerpt.repo) errors.push('repo is required');
  if (!excerpt.path) errors.push('path is required');
  if (!COMMIT.test(excerpt.commit)) errors.push('commit must be 7 to 40 hex characters');
  if (!excerpt.code) {
    errors.push('code is required');
    return errors;
  }
  const lineCount = excerpt.code.split('\n').length;
  const [first, last] = excerpt.lines;
  const range = last - first + 1;
  if (!(first >= 1 && last >= first)) errors.push('lines must be a 1-based inclusive range');
  else if (lineCount !== range) errors.push(`code has ${lineCount} lines but the range covers ${range}`);
  if (lineCount > MAX_LINES) errors.push(`code is longer than ${MAX_LINES} lines`);
  if (SECRET_PATTERNS.some((pattern) => pattern.test(excerpt.code))) errors.push('code contains secret-like content');
  return errors;
}

/**
 * Returns a valid excerpt by id. Drafts (not yet approved by Chris) are returned only when
 * `includeDrafts` is true, which only the unlinked, noindex `/preview` route does.
 *
 * @param {string} id
 * @param {{ includeDrafts?: boolean, registry?: Readonly<Record<string, Excerpt>> }} [opts]
 * @returns {Excerpt | null}
 */
export function getExcerpt(id, { includeDrafts = false, registry = excerpts } = {}) {
  const excerpt = Object.hasOwn(registry, id) ? registry[id] : undefined;
  if (!excerpt || validateExcerpt(excerpt).length > 0) return null;
  if (!excerpt.approved && !includeDrafts) return null;
  return excerpt;
}
