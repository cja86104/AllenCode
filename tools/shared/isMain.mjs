// @ts-check
import { pathToFileURL } from 'node:url';

/**
 * Whether a tool is the script Node was started with (`node tools/…/x.mjs`), not a module another
 * file imported. Compares the module's own URL with the started script's path turned into a file
 * URL, which works on Windows too (`C:\…` becomes `file:///C:/…`; `new URL(path, 'file:')` did not).
 * @param {string} importMetaUrl The tool's `import.meta.url`.
 * @param {string | undefined} argv1 `process.argv[1]`: the started script's path; absent in a REPL.
 * @param {{ windows?: boolean }} [options] Read the path as a Windows path; defaults to this platform.
 * @returns {boolean}
 */
export function isMain(importMetaUrl, argv1, { windows = process.platform === 'win32' } = {}) {
  if (!argv1) return false;
  return importMetaUrl === pathToFileURL(argv1, { windows }).href;
}
