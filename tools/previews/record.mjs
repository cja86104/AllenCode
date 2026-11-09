// @ts-check
// Films each template concept preview (tools/previews/src/<id>.html) into its loop and poster
// (spec section 7.5): a hold at the top, an eased scroll to the bottom, a hold, then a crossfade back
// to the first frame so the loop has no jump. Frames are DevTools captures stepped one at a time, so
// the motion is smooth however fast the machine is; the system ffmpeg encodes them.
// Usage: node tools/previews/build.mjs && node tools/previews/record.mjs   (needs ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const VIEWPORT = { width: 1280, height: 800 };
const FPS = 30;
const HOLD_TOP_S = 0.6;
const SCROLL_S = 5.4;
const HOLD_BOTTOM_S = 1.0;
const FADE_S = 0.5;
const MAX_LOOP_BYTES = 2 * 1024 * 1024;
const MAX_POSTER_BYTES = 150 * 1024;

/** @param {number} t 0..1 */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Scroll offset for frame `i`, as a share of the page's scrollable height.
 * @param {number} i
 */
export function scrollShare(i) {
  const t = i / FPS - HOLD_TOP_S;
  return easeInOut(Math.min(1, Math.max(0, t / SCROLL_S)));
}

export async function recordPreviews(srcDir = 'tools/previews/src', framesDir = 'tools/previews/out', outDir = 'public/media/templates') {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  mkdirSync(outDir, { recursive: true });
  const frameCount = Math.round((HOLD_TOP_S + SCROLL_S + HOLD_BOTTOM_S) * FPS);
  try {
    for (const file of readdirSync(srcDir).filter((name) => name.endsWith('.html')).sort()) {
      const id = file.replace(/\.html$/, '');
      const dir = `${framesDir}/${id}`;
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });

      const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(resolve(srcDir, file)).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const scrollable = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      for (let i = 0; i < frameCount; i += 1) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(scrollable * scrollShare(i)));
        await page.screenshot({ path: `${dir}/f${String(i + 1).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
      }
      await page.close();

      const loop = `${outDir}/${id}.mp4`;
      const poster = `${outDir}/${id}.jpg`;
      const duration = frameCount / FPS;
      execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error',
        '-framerate', String(FPS), '-i', `${dir}/f%04d.jpg`,
        '-loop', '1', '-framerate', String(FPS), '-t', String(FADE_S), '-i', `${dir}/f0001.jpg`,
        '-filter_complex', `[0:v]format=yuv420p,setsar=1[a];[1:v]format=yuv420p,setsar=1[b];[a][b]xfade=transition=fade:duration=${FADE_S}:offset=${(duration - FADE_S).toFixed(3)}[out]`,
        '-map', '[out]', '-t', duration.toFixed(3), '-an',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        loop,
      ], { stdio: 'inherit' });
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/f0001.jpg`, '-q:v', '4', poster], { stdio: 'inherit' });

      const loopBytes = statSync(loop).size;
      const posterBytes = statSync(poster).size;
      if (loopBytes > MAX_LOOP_BYTES) throw new Error(`${loop} is ${loopBytes} bytes, over 2 MB`);
      if (posterBytes > MAX_POSTER_BYTES) throw new Error(`${poster} is ${posterBytes} bytes, over 150 KB`);
      console.log(`${id}: loop ${(loopBytes / 1024).toFixed(0)} KB, poster ${(posterBytes / 1024).toFixed(0)} KB`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) await recordPreviews();
