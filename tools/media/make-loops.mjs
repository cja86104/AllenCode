// @ts-check
// Composes each live product's loop and poster from the frames capture-products.mjs saved
// (spec section 7.5): a muted H.264 crossfade through the frames that ends on the first frame, so it
// loops without a jump, plus a poster that is that first frame.
// Usage: npm run media:loops   (needs ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync } from 'node:fs';

const WIDTH = 1280;
const HEIGHT = 800;
const FPS = 30;
const FADE_S = 0.5;
const LOOP_S = 7.5;
const MAX_LOOP_BYTES = 2 * 1024 * 1024;
const MAX_POSTER_BYTES = 150 * 1024;

const scale = `scale=${WIDTH}:${HEIGHT}:flags=lanczos,setsar=1`;

/**
 * The ffmpeg arguments for one loop. Each frame holds for `hold` seconds and then fades into the
 * next; the first frame is appended again at the end and the output stops the moment it is fully
 * in, so the last picture is the first one.
 * @param {string[]} frames
 * @param {string} out
 */
export function loopArgs(frames, out) {
  const n = frames.length;
  const hold = (LOOP_S - FADE_S) / n;
  const clip = hold + FADE_S;
  const sequence = [...frames, frames[0]];
  const inputs = sequence.flatMap((frame) => ['-loop', '1', '-framerate', String(FPS), '-t', clip.toFixed(3), '-i', frame]);
  const prepare = sequence.map((_, i) => `[${i}:v]${scale},fps=${FPS},format=yuv420p[v${i}]`);
  const fades = [];
  let previous = 'v0';
  for (let k = 1; k < sequence.length; k += 1) {
    const label = k === sequence.length - 1 ? 'out' : `x${k}`;
    fades.push(`[${previous}][v${k}]xfade=transition=fade:duration=${FADE_S}:offset=${(k * hold).toFixed(3)}[${label}]`);
    previous = label;
  }
  const duration = n * hold + FADE_S;
  return [
    '-y', '-loglevel', 'error', ...inputs,
    '-filter_complex', [...prepare, ...fades].join(';'),
    '-map', '[out]', '-t', duration.toFixed(3), '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    out,
  ];
}

export function makeLoops(framesDir = 'tools/media/out', outDir = 'public/media/products') {
  mkdirSync(outDir, { recursive: true });
  for (const slug of readdirSync(framesDir)) {
    const frames = readdirSync(`${framesDir}/${slug}`)
      .filter((name) => /^frame-\d+\.png$/.test(name))
      .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
      .map((name) => `${framesDir}/${slug}/${name}`);
    if (frames.length < 4 || frames.length > 6) throw new Error(`${slug} needs 4 to 6 frames, found ${frames.length}`);

    const loop = `${outDir}/${slug}.mp4`;
    const poster = `${outDir}/${slug}.jpg`;
    execFileSync('ffmpeg', loopArgs(frames, loop), { stdio: 'inherit' });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', frames[0], '-vf', scale, '-q:v', '4', poster], { stdio: 'inherit' });

    const loopBytes = statSync(loop).size;
    const posterBytes = statSync(poster).size;
    if (loopBytes > MAX_LOOP_BYTES) throw new Error(`${loop} is ${loopBytes} bytes, over 2 MB`);
    if (posterBytes > MAX_POSTER_BYTES) throw new Error(`${poster} is ${posterBytes} bytes, over 150 KB`);
    console.log(`${slug}: ${frames.length} frames, loop ${(loopBytes / 1024).toFixed(0)} KB, poster ${(posterBytes / 1024).toFixed(0)} KB`);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) makeLoops();
