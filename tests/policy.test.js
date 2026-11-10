/** @vitest-environment node */
// @ts-check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const thisFile = fileURLToPath(import.meta.url);
const SCANNED_DIRS = ['src', 'tools', 'e2e', 'tests'];
const SOURCE_EXT = /\.(js|jsx|mjs|cjs|ts|tsx)$/;
const BANNED = /@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|ignoreBuildErrors|\bas any\b/;
const CONFIG_FILES = ['eslint.config.js', 'vitest.config.js', 'playwright.config.js', 'tailwind.config.js'];

/**
 * Returns the comment lines that precede the first statement of a file.
 * @param {string} text
 * @returns {string[]}
 */
function leadingComments(text) {
  const lines = [];
  let inBlock = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (inBlock) {
      lines.push(line);
      if (line.includes('*/')) inBlock = false;
    } else if (line === '') {
      continue;
    } else if (line.startsWith('//')) {
      lines.push(line);
    } else if (line.startsWith('/*')) {
      lines.push(line);
      if (!line.includes('*/')) inBlock = true;
    } else {
      break;
    }
  }
  return lines;
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  /** @type {string[]} */
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === 'node_modules' || name === 'out') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else if (SOURCE_EXT.test(name)) out.push(full);
  }
  return out;
}

describe('code policy', () => {
  it('no banned directives in source', () => {
    const offenders = SCANNED_DIRS.flatMap((d) => walk(join(root, d)))
      .filter((file) => file !== thisFile)
      .filter((file) => BANNED.test(readFileSync(file, 'utf8')))
      .map((file) => relative(root, file));
    expect(offenders).toEqual([]);
  });

  it('every source file opts into type checking with // @ts-check', () => {
    const missing = [...SCANNED_DIRS.flatMap((d) => walk(join(root, d))), ...CONFIG_FILES.map((f) => join(root, f))]
      .filter((file) => !leadingComments(readFileSync(file, 'utf8')).includes('// @ts-check'))
      .map((file) => relative(root, file));
    expect(missing).toEqual([]);
  });
});
