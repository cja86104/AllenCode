// @ts-check
// Films the Immersive Web Experiences chapter's screen (flagship services, Task 5): this site's own
// Code World, from the production build with the world on. The camera comes down the road to the
// fork, past its two signs (business/ and templates/custom/), and turns down the business road; then
// the Services link drives on from the home page to the Services page's road, which spells SERVICES in
// code. A crossfade back to the first frame closes the loop.
//
// Slower than the 2026-11-16 service loops (Chris: they "went too fast down the road, so much so the
// changing signs looks like a fast flicker"). Those scroll the home page at about 1.54 screens a second
// (custom-web-development.mp4: the gate's end, 1.8 screens down, at 1.75 s; the fork, 7.2, at 5.25 s;
// My Teachers Toolbox's chapter, 11.4, at 8.0 s). This one scrolls at 0.4 screens a second at most,
// about a quarter of that, so the camera, which follows the scroll, moves under a third as fast. Measured
// with `--baseline` (the same road at 1.54 screens a second), the camera's fastest is 23.2 units a
// second; this film's, printed as it runs, stays under 7.7. The drive between pages plays in real time over 0.6 s (`src/world/drive.js`: 12 units each
// half, 80 units a second at the swap); here it is shown DRIVE_SLOWDOWN (12) times slower, its fastest
// 6.7 units a second, under a third of 23.2 too.
//
// Frames are stepped one at a time on a clock this script sets (the page's `performance.now`,
// `Date.now` and animation-frame time), so the motion is smooth however slowly the machine draws the
// world (headless Chromium draws WebGL in software). The camera's eye is read from each frame's
// view-projection matrix and its speed printed, with `--baseline` measuring the same instrument at the
// 2026-11-16 loops' scroll speed. ffmpeg encodes the loop and writes the poster: a 1280 × 800 JPEG at
// 4:4:4 (no chroma subsampling, `-pix_fmt yuvj444p`) and `-q:v 2`, at least the quality of q90, from
// the first frame kept lossless.
//
// Needs ffmpeg on PATH and Playwright's Chromium (`npx playwright install chromium`, once).
// Usage (from the repo root):
//   npm run build
//   npm run preview -- --port 4173            (in another terminal)
//   node tools/media/record-immersive.mjs              (films it, then encodes the loop and poster)
//   node tools/media/record-immersive.mjs --baseline   (measures the camera at the old speed)
//   node tools/media/record-immersive.mjs --encode     (encodes the frames already filmed again)
//   node tools/media/record-immersive.mjs --poster     (writes only the poster again, from the first frame)
// Encodes into tools/media/out/ and, once within its limits, copies the loop and poster to
// public/media/services/immersive-web-experiences.mp4 and .jpg; frames go to
// tools/media/out/immersive-web-experiences/ (ignored by git).
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { isMain } from '../shared/isMain.mjs';

const ORIGIN = process.env.RECORD_ORIGIN ?? 'http://localhost:4173';
const SLUG = 'immersive-web-experiences';
const VIEWPORT = { width: 1280, height: 800 };
const FPS = 24;
/** The 2026-11-16 loops' scroll speed, in screens a second (measured from their video, above). */
const OLD_SCREENS_PER_S = 1.54;
/** This loop's top scroll speed, in screens a second: about a quarter of the old. */
const SCREENS_PER_S = 0.4;
/** Where the film starts and stops scrolling, in screens: on the road with the fork's two signs read
 * from the first frame; then at the fork, "business/" passing overhead. Kept this short (2026-11-27) so
 * the loop fits 700 KB at CRF 30 or better. */
const FROM_SCREENS = 6.8;
const TO_SCREENS = 8.0;
/** The scroll speeds up and slows down over this long, at each end. */
const RAMP_S = 0.6;
const HOLD_START_S = 0.3;
const HOLD_ROAD_S = 0.2;
/** The drive between pages lasts 0.6 s (`DRIVE_MS`); shown this many times slower. */
const DRIVE_MS = 600;
const DRIVE_SLOWDOWN = 12;
/**
 * While the drive has the world all but faded out (the canvas below this opacity, around the swap),
 * nothing on screen moves, so those moments play at the drive's real speed rather than slowed: no
 * near-dark pause in the film. They are left out of the speed measured.
 */
const DARK_OPACITY = 0.25;
const HOLD_END_S = 0.4;
const FADE_S = 0.5;
/** The other service loops' limit (tests/serviceScreens.test.js), and the screens' limit (CLAUDE.md). */
const MAX_LOOP_BYTES = 700 * 1024;
const MAX_POSTER_BYTES = 400 * 1024;
/**
 * Encoder settings tried in turn until the loop fits its limit: `veryfast` first, then slower presets,
 * which fit more in the same size. Never above CRF 30: past it the mist and sky break into blocks. If
 * the full size cannot fit at CRF 30, the film is encoded a little smaller (1120 × 700, shown in a box
 * of about 650 px on a 1280 px screen) rather than at a higher CRF.
 */
const ENCODINGS = [
  { preset: 'veryfast', crf: 28, width: 1280, height: 800 },
  { preset: 'veryfast', crf: 30, width: 1280, height: 800 },
  { preset: 'veryslow', crf: 30, width: 1280, height: 800 },
  { preset: 'veryslow', crf: 29, width: 1120, height: 700 },
  { preset: 'veryslow', crf: 30, width: 1120, height: 700 },
];

/**
 * Scroll position, in screens, `t` seconds into the scroll: a constant speed with linear ramps at each
 * end, never faster than `speed`. Returns the position and whether the scroll is over.
 * @param {number} t @param {number} from @param {number} to @param {number} speed
 */
export function scrollAt(t, from, to, speed) {
  const distance = to - from;
  const cruise = Math.max(0, distance / speed - RAMP_S);
  const total = cruise + 2 * RAMP_S;
  if (t <= 0) return { at: from, done: false };
  if (t >= total) return { at: to, done: true };
  const ramp = (/** @type {number} */ s) => (speed * s * s) / (2 * RAMP_S);
  if (t < RAMP_S) return { at: from + ramp(t), done: false };
  if (t < RAMP_S + cruise) return { at: from + ramp(RAMP_S) + speed * (t - RAMP_S), done: false };
  return { at: to - ramp(total - t), done: false };
}

/**
 * The camera's eye from a column-major view-projection matrix: the point clip x, y and w all vanish at.
 * @param {number[]} m
 * @returns {[number, number, number] | null}
 */
export function eyeOf(m) {
  const rows = [0, 1, 3].map((i) => [m[i], m[4 + i], m[8 + i], m[12 + i]]);
  const [a, b, c] = rows;
  const det = (/** @type {number[]} */ p, /** @type {number[]} */ q, /** @type {number[]} */ r) =>
    p[0] * (q[1] * r[2] - q[2] * r[1]) - p[1] * (q[0] * r[2] - q[2] * r[0]) + p[2] * (q[0] * r[1] - q[1] * r[0]);
  const d = det(a, b, c);
  if (Math.abs(d) < 1e-12) return null;
  const rhs = [-a[3], -b[3], -c[3]];
  const col = (/** @type {number} */ k) => [a, b, c].map((row, i) => row.map((v, j) => (j === k ? rhs[i] : v)));
  return /** @type {[number, number, number]} */ ([0, 1, 2].map((k) => {
    const [p, q, r] = col(k);
    return det(p, q, r) / d;
  }));
}

/**
 * Runs in the page before its own scripts: a clock this script sets (frozen once `freeze` is called),
 * and the last view-projection matrix the world drew with.
 */
function installClock() {
  const realNow = performance.now.bind(performance);
  const realDate = Date.now.bind(Date);
  /** @type {number | null} */
  let virtual = null;
  let dateBase = 0;
  performance.now = () => (virtual === null ? realNow() : virtual);
  Date.now = () => (virtual === null ? realDate() : Math.round(dateBase + virtual));
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => raf((time) => callback(virtual === null ? time : virtual));
  /** @type {WeakSet<WebGLUniformLocation>} */
  const viewProjection = new WeakSet();
  const proto = WebGL2RenderingContext.prototype;
  const getUniformLocation = proto.getUniformLocation;
  proto.getUniformLocation = function (program, name) {
    const location = getUniformLocation.call(this, program, name);
    if (location && name === 'uViewProjection') viewProjection.add(location);
    return location;
  };
  const uniformMatrix4fv = proto.uniformMatrix4fv;
  /** @type {number[] | null} */
  let matrix = null;
  /**
   * @this {WebGL2RenderingContext}
   * @param {WebGLUniformLocation | null} location @param {boolean} transpose @param {Float32List} data
   * @param {[number?, number?]} rest
   */
  const capture = function (location, transpose, data, ...rest) {
    if (location && viewProjection.has(location)) matrix = Array.from(data);
    return uniformMatrix4fv.call(this, location, transpose, data, ...rest);
  };
  proto.uniformMatrix4fv = capture;
  Reflect.set(window, '__recorder', {
    freeze() {
      dateBase = realDate() - realNow();
      virtual = realNow();
      return virtual;
    },
    /** @param {number} ms */
    set(ms) {
      virtual = ms;
    },
    take() {
      const taken = matrix;
      matrix = null;
      return taken;
    },
  });
}

/**
 * Sets the page's clock (and scroll, if given), lets two animation frames draw, and returns the
 * camera matrix drawn with, if any.
 * @param {import('@playwright/test').Page} page @param {number} ms @param {number | null} y
 * @returns {Promise<number[] | null>}
 */
function step(page, ms, y) {
  return page.evaluate(
    async ([time, top]) => {
      const recorder = Reflect.get(window, '__recorder');
      recorder.take();
      if (top !== null) window.scrollTo(0, top);
      recorder.set(time);
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(undefined))));
      return /** @type {number[] | null} */ (recorder.take());
    },
    /** @type {[number, number | null]} */ ([ms, y]),
  );
}

/**
 * Opens the home page with business/ already taken, scrolled to `startScreens`, and freezes its clock.
 * @param {import('@playwright/test').Page} page @param {number} startScreens
 * @returns {Promise<number>} The clock's time.
 */
async function openRoad(page, startScreens) {
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
  await page.addInitScript(installClock);
  await page.goto(`${ORIGIN}/?world=1`, { waitUntil: 'load' });
  await page.locator('canvas[data-world][data-ready="true"]').waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  // Let the road and its chapters come in at the start, as a visitor's scroll would bring them.
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(startScreens * VIEWPORT.height));
  await page.waitForTimeout(3000);
  return page.evaluate(() => /** @type {number} */ (Reflect.get(window, '__recorder').freeze()));
}

/**
 * The camera's speeds, in world units a second of film, between consecutive drawn frames, by part of
 * the film; the drive's swap from the old world to the new (`drive:out` to `drive:in`) is not a move,
 * nor is any step into or out of the drive's dark middle, which nothing on screen shows.
 * @param {Array<{ eye: [number, number, number] | null, part: string }>} frames
 */
function speeds(frames) {
  /** @type {Record<string, number[]>} */
  const byPart = {};
  /** @type {{ eye: [number, number, number], part: string } | null} */
  let last = null;
  let gap = 0;
  for (const frame of frames) {
    gap += 1;
    if (!frame.eye) continue;
    if (frame.part === 'drive:dark' || last?.part === 'drive:dark') {
      last = { eye: frame.eye, part: frame.part };
      gap = 0;
      continue;
    }
    if (last && !(last.part === 'drive:out' && frame.part === 'drive:in')) {
      const d = Math.hypot(frame.eye[0] - last.eye[0], frame.eye[1] - last.eye[1], frame.eye[2] - last.eye[2]);
      (byPart[frame.part] ??= []).push((d * FPS) / gap);
    }
    last = { eye: frame.eye, part: frame.part };
    gap = 0;
  }
  return Object.fromEntries(
    Object.entries(byPart).map(([part, list]) => [part, { mean: +(list.reduce((s, v) => s + v, 0) / list.length).toFixed(2), max: +Math.max(...list).toFixed(2) }]),
  );
}

/** Measures the camera at the 2026-11-16 loops' scroll speed, from the gate's end to the first chapter. */
async function baseline() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    let time = await openRoad(page, 1.8);
    /** @type {Array<{ eye: [number, number, number] | null, part: string }>} */
    const frames = [];
    for (let i = 0; ; i += 1) {
      const { at, done } = scrollAt(i / FPS, 1.8, 12.43, OLD_SCREENS_PER_S);
      time += 1000 / FPS;
      const matrix = await step(page, time, Math.round(at * VIEWPORT.height));
      frames.push({ eye: matrix ? eyeOf(matrix) : null, part: at < 9.6 ? 'opening' : 'road' });
      if (done) break;
    }
    console.log('2026-11-16 speed (1.54 screens/s), units a second:', speeds(frames));
  } finally {
    await browser.close();
  }
}

async function film() {
  const dir = `tools/media/out/${SLUG}`;
  const outDir = 'public/media/services';
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  /** @type {Array<{ eye: [number, number, number] | null, part: string }>} */
  const frames = [];
  let n = 0;
  try {
    const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    let time = await openRoad(page, FROM_SCREENS);
    const canvas = page.locator('canvas[data-world]');
    /**
     * Moves the clock on by `dt` ms (and the page to `y`), and films the frame drawn.
     * @param {number | null} y @param {string} part @param {number} [dt]
     * @returns {Promise<{ drive: string | null, opacity: number }>} The canvas's `data-drive` and opacity.
     */
    const shoot = async (y, part, dt = 1000 / FPS) => {
      time += dt;
      const matrix = await step(page, time, y);
      n += 1;
      const name = `${dir}/f${String(n).padStart(4, '0')}`;
      // The first frame is also the poster, kept lossless until ffmpeg writes it.
      if (n === 1) await page.screenshot({ path: `${name}.png`, type: 'png' });
      await page.screenshot({ path: `${name}.jpg`, type: 'jpeg', quality: 92 });
      const drive = await canvas.getAttribute('data-drive');
      const opacity = await canvas.evaluate((el) => parseFloat(/** @type {HTMLElement} */ (el).style.opacity || '1'));
      const dark = drive !== null && opacity < DARK_OPACITY;
      frames.push({ eye: matrix ? eyeOf(matrix) : null, part: dark ? 'drive:dark' : drive ? `drive:${drive}` : part });
      return { drive, opacity };
    };
    const px = (/** @type {number} */ screens) => Math.round(screens * VIEWPORT.height);

    for (let i = 0; i < Math.round(HOLD_START_S * FPS); i += 1) await shoot(px(FROM_SCREENS), 'hold');
    for (let i = 1; ; i += 1) {
      const { at, done } = scrollAt(i / FPS, FROM_SCREENS, TO_SCREENS, SCREENS_PER_S);
      await shoot(px(at), 'road');
      if (done) break;
    }
    for (let i = 0; i < Math.round(HOLD_ROAD_S * FPS); i += 1) await shoot(null, 'hold');

    // The drive: the Services link (clicked without the pointer, so no cursor or focus ring is filmed),
    // then the drive played DRIVE_SLOWDOWN times slower, until it is over; its dark middle at real speed.
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services', exact: true }).evaluate((link) => /** @type {HTMLElement} */ (link).click());
    const driveFrames = Math.round((DRIVE_MS / 1000) * DRIVE_SLOWDOWN * FPS);
    /** @type {Array<string | null>} */
    const seen = [];
    let dark = 0;
    let dt = 1000 / FPS / DRIVE_SLOWDOWN;
    for (let i = 0; i < driveFrames * 2; i += 1) {
      const { drive, opacity } = await shoot(null, 'arrived', dt);
      const isDark = drive !== null && opacity < DARK_OPACITY;
      if (isDark) dark += 1;
      dt = isDark ? 1000 / FPS : 1000 / FPS / DRIVE_SLOWDOWN;
      if (seen[seen.length - 1] !== drive) seen.push(drive);
      if (drive === null && seen.includes('in')) break;
    }
    if (seen.filter(Boolean).join(',') !== 'out,in' || seen[seen.length - 1] !== null) throw new Error(`the drive did not play out then in: ${seen.join(',')}`);
    if (!page.url().endsWith('/services')) throw new Error(`the drive ended on ${page.url()}`);
    console.log(`the drive: ${dark} frames below ${DARK_OPACITY} opacity, played at real speed`);
    for (let i = 0; i < Math.round(HOLD_END_S * FPS); i += 1) await shoot(null, 'hold');
    await page.close();
  } finally {
    await browser.close();
  }
  console.log(`${n} frames; camera speed, units a second of film:`, speeds(frames));
  encode(dir, outDir, n);
}

/** The ffmpeg filter that sizes a frame for an encoding. @param {{ width: number, height: number }} size */
const fit = ({ width, height }) => `scale=${width}:${height}:flags=lanczos,format=yuv420p,setsar=1`;

/**
 * The ffmpeg arguments that write a lossless frame as the poster: one JPEG, its full size, 4:4:4
 * (`yuvj444p`, the same as Pillow's `subsampling=0`) at `-q:v 2`, which keeps at least as much as q90.
 * @param {string} png The lossless frame. @param {string} jpg The poster to write.
 * @returns {string[]}
 */
export function posterArgs(png, jpg) {
  return ['-y', '-loglevel', 'error', '-i', png, '-frames:v', '1', '-update', '1', '-c:v', 'mjpeg', '-pix_fmt', 'yuvj444p', '-q:v', '2', jpg];
}

/**
 * Writes the poster from a lossless frame with ffmpeg, and fails if it is over the screens' limit.
 * @param {string} png @param {string} jpg
 */
function writePoster(png, jpg) {
  execFileSync('ffmpeg', posterArgs(png, jpg), { stdio: 'inherit' });
  const bytes = statSync(jpg).size;
  if (bytes > MAX_POSTER_BYTES) throw new Error(`${jpg} is ${bytes} bytes, over 400 KB`);
}

/**
 * Encodes the filmed frames into the loop (crossfading back to the first frame) and writes the poster.
 * @param {string} dir @param {string} outDir @param {number} n The frames filmed.
 */
function encode(dir, outDir, n) {
  // Encoded beside the frames, and copied to the site only once both files are within their limits,
  // so a failed run never leaves a bad file in public/.
  const loop = `${dir}.mp4`;
  const poster = `${dir}.jpg`;
  const duration = n / FPS;
  /** @type {(typeof ENCODINGS)[number] | null} */
  let used = null;
  for (const encoding of ENCODINGS) {
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-framerate', String(FPS), '-i', `${dir}/f%04d.jpg`,
      '-loop', '1', '-framerate', String(FPS), '-t', String(FADE_S), '-i', `${dir}/f0001.jpg`,
      '-filter_complex', `[0:v]${fit(encoding)}[a];[1:v]${fit(encoding)}[b];[a][b]xfade=transition=fade:duration=${FADE_S}:offset=${(duration - FADE_S).toFixed(3)}[out]`,
      '-map', '[out]', '-t', duration.toFixed(3), '-an',
      '-c:v', 'libx264', '-preset', encoding.preset, '-crf', String(encoding.crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      loop,
    ], { stdio: 'inherit' });
    if (statSync(loop).size <= MAX_LOOP_BYTES) {
      used = encoding;
      break;
    }
  }
  if (!used) throw new Error(`${loop} is ${statSync(loop).size} bytes, over 700 KB at every setting tried (CRF 30 at most): trim the film`);
  writePoster(`${dir}/f0001.png`, poster);

  const loopBytes = statSync(loop).size;
  const posterBytes = statSync(poster).size;
  mkdirSync(outDir, { recursive: true });
  copyFileSync(loop, `${outDir}/${SLUG}.mp4`);
  copyFileSync(poster, `${outDir}/${SLUG}.jpg`);
  console.log(`${SLUG}: ${duration.toFixed(2)} s, loop ${(loopBytes / 1024).toFixed(0)} KB (${used.width} × ${used.height}, ${used.preset}, CRF ${used.crf}), poster ${(posterBytes / 1024).toFixed(0)} KB`);
}

if (isMain(import.meta.url, process.argv[1])) {
  if (process.argv.includes('--baseline')) await baseline();
  else if (process.argv.includes('--encode')) {
    // Encodes the frames already filmed, without filming again.
    const dir = `tools/media/out/${SLUG}`;
    encode(dir, 'public/media/services', readdirSync(dir).filter((name) => name.endsWith('.jpg')).length);
  } else if (process.argv.includes('--poster')) {
    // Writes only the poster again, from the first frame already filmed; the loop is left as it is.
    const poster = `tools/media/out/${SLUG}.jpg`;
    writePoster(`tools/media/out/${SLUG}/f0001.png`, poster);
    copyFileSync(poster, `public/media/services/${SLUG}.jpg`);
    console.log(`${SLUG}: poster ${(statSync(poster).size / 1024).toFixed(0)} KB`);
  } else await film();
}
