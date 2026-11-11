// @ts-check
/**
 * The JavaScript and CSS budget (Phase 8), checked against `dist/` after `npm run build`. Each limit
 * is the size measured on 2026-11-10 plus about 5 percent, in gzip kilobytes; going over fails the
 * run, so growth is a decision, not an accident. Measured then: entry script 145.48 kB, entry CSS
 * 7.08 kB, home page 13.6 kB, renderer 57.25 kB, shared excerpt chunk 9.06 kB.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = join(process.cwd(), 'dist');
const ASSETS = join(DIST, 'assets');

/** @type {ReadonlyArray<{ name: string, limitKb: number, match: (file: string, entry: { script: string, style: string }) => boolean }>} */
export const BUDGETS = Object.freeze([
  { name: 'entry script (every page)', limitKb: 152, match: (file, entry) => file === entry.script },
  { name: 'entry CSS (every page)', limitKb: 9, match: (file, entry) => file === entry.style },
  { name: 'home page chunk', limitKb: 16, match: (file) => /^Home-.*\.js$/.test(file) },
  { name: 'renderer chunk (after first paint)', limitKb: 62, match: (file) => /^FieldScene-.*\.js$/.test(file) },
  // The Code world prototype's lab page (/lab/world), which the site never loads (Task P2).
  { name: 'code world lab (lab route only)', limitKb: 40, match: (file) => /^WorldLab-.*\.js$/.test(file) },
  {
    name: 'any other script chunk',
    limitKb: 12,
    match: (file, entry) => file.endsWith('.js') && file !== entry.script && !/^(Home|FieldScene|WorldLab)-/.test(file),
  },
]);

/** @param {string} file */
// Kilobytes of 1000 bytes, as Vite reports them, so the two always agree.
const gzipKb = (file) => gzipSync(readFileSync(join(ASSETS, file))).length / 1000;

function entryFiles() {
  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const script = html.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/)?.[1];
  const style = html.match(/<link[^>]+href="\/assets\/([^"]+\.css)"/)?.[1];
  if (!script || !style) throw new Error('dist/index.html has no entry script or stylesheet; run npm run build first.');
  return { script, style };
}

const entry = entryFiles();
const files = readdirSync(ASSETS).filter((file) => /\.(js|css)$/.test(file));
let over = 0;
for (const budget of BUDGETS) {
  for (const file of files.filter((f) => budget.match(f, entry))) {
    const kb = gzipKb(file);
    const ok = kb <= budget.limitKb;
    if (!ok) over += 1;
    console.log(`${ok ? 'ok  ' : 'OVER'}  ${budget.name.padEnd(36)} ${kb.toFixed(2).padStart(7)} kB of ${budget.limitKb} kB  ${file}`);
  }
}
if (over > 0) {
  console.error(`\n${over} file(s) over budget. Shrink them, or raise the limit in tools/budget/check.mjs as a recorded decision.`);
  process.exit(1);
}
