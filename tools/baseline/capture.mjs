// @ts-check
// Captures the plain (world-off) site as the baseline later phases are measured against:
// for every target, a full-page screenshot, a scroll-through video and a manifest entry.
// Usage: npm run build, then npm run preview -- --port 4173, then
//        npm run baseline:capture [-- <baseUrl>]      (default http://localhost:4173)
// Writes baseline-captures/<YYYY-MM-DD>/<id>.png, <id>.webm, <id>/frame-NNN.png and manifest.json.
// (Not under test-results/: Playwright empties that folder at the start of every run.)
// Needs Playwright's Chromium (`npx playwright install chromium`), or PLAYWRIGHT_BROWSERS_PATH.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { sitemapPaths } from '../prerender/routes.mjs';
import { frameOffsets } from './frames.mjs';
import { captureDir } from './output.mjs';
import { baselineTargets, VIEWPORTS } from './targets.mjs';

const DEFAULT_BASE_URL = 'http://localhost:4173';
const SCROLL_PX_PER_SECOND = 600;
const SETTLE_MS = 1500;
const FRAME_SETTLE_MS = 400;
const WORLD_KEY = 'allencode:world';
const DOOR_KEY = 'allencode:door';
const UNREACHABLE_MESSAGE = (/** @type {string} */ url) =>
  `Cannot reach ${url}. Start the site first: npm run build, then npm run preview -- --port 4173.`;
const DEV_SERVER_MESSAGE = 'Run against `npm run preview`, not the dev server.';

const root = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Scrolls the window to `top` at a steady speed, a step every animation frame, so pinned chapters
 * and reveal animations play.
 * @param {import('@playwright/test').Page} page
 * @param {number} top
 * @param {number} pxPerSecond
 * @returns {Promise<void>}
 */
async function scrollTo(page, top, pxPerSecond) {
  await page.evaluate(
    ({ target, speed }) =>
      new Promise((resolve) => {
        let last = performance.now();
        let y = window.scrollY;
        const step = (/** @type {number} */ now) => {
          y = Math.min(y + ((now - last) / 1000) * speed, target);
          last = now;
          window.scrollTo({ top: y, behavior: 'instant' });
          if (y >= target) resolve(undefined);
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { target: top, speed: pxPerSecond },
  );
}

/**
 * Scrolls from the top to the bottom at a steady speed, stopping at each frame position (the top,
 * every viewport height, the bottom) to let the scene settle and save a viewport-sized screenshot.
 * The page height is re-read at every stop, as the page can grow while it is read.
 * @param {import('@playwright/test').Page} page
 * @param {string} framesDir
 * @param {string} id
 * @returns {Promise<string[]>} The frame files, relative to the capture folder.
 */
async function scrollThrough(page, framesDir, id) {
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  rmSync(framesDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  mkdirSync(framesDir, { recursive: true });
  /** @type {string[]} */
  const frames = [];
  let y = 0;
  for (;;) {
    await page.waitForTimeout(FRAME_SETTLE_MS);
    const name = `frame-${String(frames.length).padStart(3, '0')}.png`;
    await page.screenshot({ path: join(framesDir, name) });
    frames.push(`${id}/${name}`);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const next = frameOffsets(height, viewportHeight).find((offset) => offset > y);
    if (next === undefined) return frames;
    await scrollTo(page, next, SCROLL_PX_PER_SECOND);
    y = next;
  }
}

/**
 * Refuses a dev server: its pages carry Vite's client, and its timings are not the site's.
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function refuseDevServer(baseUrl) {
  /** @type {string} */
  let html;
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch {
    console.error(UNREACHABLE_MESSAGE(baseUrl));
    process.exit(1);
  }
  if (html.includes('/@vite/client')) {
    console.error(DEV_SERVER_MESSAGE);
    process.exit(1);
  }
}

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {import('./targets.mjs').Target} target
 * @param {string} baseUrl
 * @param {string} outDir
 */
async function captureTarget(browser, target, baseUrl, outDir) {
  const started = Date.now();
  const recordingDir = join(outDir, `.recording-${target.id}`);
  const size = VIEWPORTS[target.viewport];
  const viewport = { width: size.width, height: size.height };
  const context = await browser.newContext({
    viewport,
    hasTouch: size.touch,
    isMobile: size.touch,
    reducedMotion: target.reducedMotion ? 'reduce' : 'no-preference',
    recordVideo: { dir: recordingDir, size: viewport },
  });
  try {
    await context.addInitScript(
      ({ worldKey, doorKey, door }) => {
        try {
          window.sessionStorage.setItem(worldKey, '0');
          if (door) window.sessionStorage.setItem(doorKey, door);
        } catch {
          // Storage blocked: the visit keeps its defaults.
        }
      },
      { worldKey: WORLD_KEY, doorKey: DOOR_KEY, door: target.door },
    );
    const page = await context.newPage();
    const video = page.video();
    await page.goto(new URL(target.path, baseUrl).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    const frames = await scrollThrough(page, join(outDir, target.id), target.id);
    await page.waitForTimeout(SETTLE_MS);
    // The screenshot is taken scrolled back to the top, the same for every target.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(SETTLE_MS);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const screenshot = `${target.id}.png`;
    await page.screenshot({ path: join(outDir, screenshot), fullPage: true });
    await context.close();
    if (!video) throw new Error(`No video was recorded for ${target.id}.`);
    const videoFile = `${target.id}.webm`;
    await video.saveAs(join(outDir, videoFile));
    await video.delete();
    return { ...target, screenshot, video: videoFile, frames, pageHeight, seconds: (Date.now() - started) / 1000 };
  } finally {
    try {
      await context.close();
      // Retries ride out Windows file locks (EBUSY, EPERM) while the recorder lets go of the folder.
      rmSync(recordingDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (error) {
      // A cleanup failure must not turn a written target into a failure.
      console.warn(`${target.id}: could not remove ${recordingDir}, ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function main() {
  const baseUrl = process.argv[2] ?? DEFAULT_BASE_URL;
  await refuseDevServer(baseUrl);
  const started = new Date();
  const outDir = captureDir(root, started);
  mkdirSync(outDir, { recursive: true });
  const paths = sitemapPaths(readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8'));
  const targets = baselineTargets(paths);
  const browser = await chromium.launch();
  /** @type {Array<Awaited<ReturnType<typeof captureTarget>> | (import('./targets.mjs').Target & { error: string })>} */
  const entries = [];
  try {
    for (const target of targets) {
      try {
        const entry = await captureTarget(browser, target, baseUrl, outDir);
        entries.push(entry);
        console.log(`${target.id}: ${entry.pageHeight}px, ${entry.seconds.toFixed(1)}s`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        entries.push({ ...target, error: message });
        console.error(`${target.id}: FAILED, ${message}`);
      }
    }
  } finally {
    await browser.close();
  }
  const manifest = {
    baseUrl,
    startedAt: started.toISOString(),
    seconds: (Date.now() - started.getTime()) / 1000,
    method: {
      world: 'off (sessionStorage allencode:world = 0 for every target)',
      scroll: `window scrolled from top to bottom at ${SCROLL_PX_PER_SECOND} px a second, one step per animation frame, between stops; it stops (about ${FRAME_SETTLE_MS} ms) at the top, at every viewport height and at the bottom, so the video holds those pauses and its length is longer than height / ${SCROLL_PX_PER_SECOND} s`,
      frames: 'at each stop a viewport-sized screenshot after the settle, <id>/frame-NNN.png, listed in each entry as frames',
      screenshot: 'full page, taken after the scroll-through with the window scrolled back to the top',
      video: 'one recording per target, sized to its viewport, covering load, settle and the scroll-through',
    },
    entries,
  };
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const failed = entries.filter((entry) => 'error' in entry).length;
  console.log(`Wrote ${entries.length} entries (${failed} failed) to ${outDir}`);
  if (failed > 0) process.exitCode = 1;
}

await main();
