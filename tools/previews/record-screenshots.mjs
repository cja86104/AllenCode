// @ts-check
// Makes a template's loop and poster from screenshots of its pages, for a template whose photographs
// cannot be filmed here (record-template.mjs needs the template running with its images reachable).
// Each screenshot is scaled to the loop's full width and centred on a blurred, darkened copy of itself,
// so nothing on the page is cropped. The screenshots hold in the order given, crossfading from one to
// the next, and the last crossfades back to the first so the loop is seamless. The first is the poster.
//   node tools/previews/record-screenshots.mjs <id> <first.png> <second.png> ...   (needs ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';

const WIDTH = 1280;
const HEIGHT = 800;
const FPS = 30;
/** Each screenshot's share of the loop; the crossfade into the next takes the last FADE_S of it. */
const HOLD_S = 2.0;
const FADE_S = 0.5;
const MAX_LOOP_BYTES = 2 * 1024 * 1024;
const MAX_POSTER_BYTES = 150 * 1024;

/** One screenshot, scaled to the full width over a blurred fill of itself. */
const FIT = `split[bg][fg];[bg]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},boxblur=24:2,eq=brightness=-0.25[bgb];[fg]scale=${WIDTH}:-2[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p`;

/**
 * @param {string} id
 * @param {string[]} shots screenshots, in the order they play
 * @param {string} [outDir]
 */
export function recordScreenshots(id, shots, outDir = 'public/media/templates') {
  if (shots.length < 2) throw new Error('A loop needs at least two screenshots.');
  for (const shot of shots) if (!existsSync(shot)) throw new Error(`No screenshot at ${shot}`);
  mkdirSync(outDir, { recursive: true });

  // The first screenshot is appended once more, only to carry the closing crossfade, so the loop ends on
  // the frame it starts on.
  const sequence = [...shots, shots[0]];
  const clip = HOLD_S + FADE_S;
  const inputs = sequence.flatMap((shot) => ['-loop', '1', '-framerate', String(FPS), '-t', clip.toFixed(3), '-i', shot]);
  const filters = sequence.map((_, index) => `[${index}:v]${FIT}[s${index}]`);
  let previous = 's0';
  for (let index = 1; index < sequence.length; index += 1) {
    const label = index === shots.length ? 'out' : `x${index}`;
    filters.push(`[${previous}][s${index}]xfade=transition=fade:duration=${FADE_S}:offset=${(index * HOLD_S - FADE_S).toFixed(3)}[${label}]`);
    previous = label;
  }
  const duration = shots.length * HOLD_S;

  const loop = `${outDir}/${id}.mp4`;
  const poster = `${outDir}/${id}.jpg`;
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[out]', '-t', duration.toFixed(3), '-r', String(FPS), '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    loop,
  ], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', shots[0], '-vf', FIT, '-frames:v', '1', '-q:v', '4', poster], { stdio: 'inherit' });

  const loopBytes = statSync(loop).size;
  const posterBytes = statSync(poster).size;
  if (loopBytes > MAX_LOOP_BYTES) throw new Error(`${loop} is ${loopBytes} bytes, over 2 MB`);
  if (posterBytes > MAX_POSTER_BYTES) throw new Error(`${poster} is ${posterBytes} bytes, over 150 KB`);
  console.log(`${id}: loop ${(loopBytes / 1024).toFixed(0)} KB over ${duration.toFixed(1)} s, poster ${(posterBytes / 1024).toFixed(0)} KB`);
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const [id, ...shots] = process.argv.slice(2);
  if (!id || !/^[a-z0-9-]+$/.test(id) || shots.length < 2) {
    console.error('Usage: node tools/previews/record-screenshots.mjs <id> <first.png> <second.png> ...');
    process.exit(1);
  }
  recordScreenshots(id, shots);
}
