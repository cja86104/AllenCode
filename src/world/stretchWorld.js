// @ts-check
import ambient from '../content/excerpts/ambient.js';
import { resolveTransform } from '../field/resolveTransform.js';
import { editorSize } from '../field/editorMetrics.js';
import { cameraAt } from './camera.js';
import { TYPED_TO } from './journey.js';
import { landmarkRect } from './landmark.js';
import { roadSizes } from './roadLayout.js';
import { inkBefore, slabCaret } from './shapes.js';
import { layoutStretch, STRETCH } from './stretchLayout.js';
import { buildStretchWorld } from './stretchShapes.js';
import { driveAt, driveCamera } from './drive.js';
import { readPicture, screenOf } from './screens.js';
import { flightBudgetFor, toWorldFlight } from './worldFlight.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./stretches.js').Stretch} Stretch */
/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */

/** The unfinished file's cursor blinks on and off this often, as on the home road. */
const BLINK_MS = 530;
/** As the home's world fades a flight while the real thing takes over. */
const FLIGHT_FADE_FROM = 0.92;
/** The lead's code lifts off over this share of the stretch from the landing's start. */
const LIFT_SHARE = 0.04;
/** The world fades out from this share of the landing, gone as the headline lands. */
const WORLD_FADE_FROM = 0.8;
/** Landing text is sampled about this many times per line of the headline's font size. */
const STEPS_PER_FONT = 12;

/** @param {number} a @param {number} b @param {number} x */
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * The headline's text as it is laid out, line by line (its own breaks), its font, and its alignment
 * (W7: the 404 and checkout success pages centre theirs).
 * @param {HTMLElement} headline
 * @returns {{ text: string, font: string, fontPx: number, align: 'left' | 'center' }}
 */
function headlineText(headline) {
  const style = getComputedStyle(headline);
  const fontPx = parseFloat(style.fontSize) || 48;
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const range = document.createRange();
  /** @type {string[]} */
  const lines = [];
  let current = '';
  let top = Number.NaN;
  const walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    for (const word of text.matchAll(/\S+/g)) {
      const at = word.index ?? 0;
      range.setStart(node, at);
      range.setEnd(node, at + word[0].length);
      const rect = range.getBoundingClientRect();
      if (Number.isNaN(top) || Math.abs(rect.top - top) > rect.height / 2) {
        if (current) lines.push(current);
        current = word[0];
        top = rect.top;
      } else {
        current += ` ${word[0]}`;
      }
    }
  }
  if (current) lines.push(current);
  return { text: lines.join('\n'), font, fontPx, align: style.textAlign === 'center' ? 'center' : 'left' };
}

/**
 * An inner page's world (Code World W5a):
 * - the stretch's road and landmarks, the camera driving down it with the scroll through the page's
 *   spacer (`[data-world-stretch]`) and resting square on to the lead;
 * - the ground beneath it, the hollow mist and the cursor's ripples, from the home's surroundings
 *   (2026-11-17), laid flat under the stretch's road;
 * - the lead's code landing as the page's headline (`main h1`), where the headline stands once the
 *   spacer has scrolled away; the page itself is held back until then, so it does not rise over the
 *   world, and fades in as the world fades out;
 * - each landmark's picture once passed (the lead's as its code lifts off), and Crew Advisors' cursor.
 * It marks the canvas for tests: `data-page`, `data-stretch-progress`, `data-flight`.
 * @param {{
 *   renderer: ReturnType<typeof import('./worldRenderer.js').createWorldRenderer>,
 *   atlas: { indexOf: (char: string) => number },
 *   tier: 'low' | 'mid' | 'high',
 *   canvas: HTMLCanvasElement,
 *   scrim: HTMLElement | null,
 *   surroundings?: ReturnType<typeof import('./surroundings.js').createSurroundings> | null,
 * }} deps
 */
export function createStretchWorld({ renderer, atlas, tier, canvas, scrim, surroundings = null }) {
  /** @type {Stretch | null} */
  let built = null;
  let builtWidth = 0;
  let builtHeight = 0;
  let picturesBuilt = -1;
  /** @type {Record<string, Pixels>} */
  const read = {};
  /** @type {ReturnType<typeof layoutStretch> | null} */
  let layout = null;
  /** @type {{ start: number, count: number } | null} */
  let leadRange = null;
  /** @type {{ start: number, cursor: number, code: string, center: Vec3, facing: Vec3, lead: boolean } | null} */
  let unfinished = null;
  /** The page's headline the lead's code lands on, and the page itself (the spacer's next sibling),
   * held back until the landing lands; whether the flight is placed (or on its way). */
  /** @type {HTMLElement | null} */
  let headline = null;
  /** @type {HTMLElement | null} */
  let held = null;
  let flightPlaced = false;
  let flightPending = false;
  /** Set when the landing could not be laid out: the headline simply shows, as on the plain page. */
  let flightFailed = false;
  /** Bumped on every build, so a landing resolved for an old build is dropped. */
  let generation = 0;
  /**
   * The drive between pages (W5b), while it plays: when it started, the camera it left from and how
   * much of the world it left was shown.
   * @type {{ start: number, from: { eye: Vec3, target: Vec3, fov: number }, shown: number } | null}
   */
  let driving = null;

  const restoreHeadline = () => {
    if (held) held.style.opacity = '';
    held = null;
    headline = null;
  };

  /** @param {Stretch} stretch @param {{ width: number, height: number }} viewport */
  const build = (stretch, viewport) => {
    if (stretch !== built) restoreHeadline();
    built = stretch;
    builtWidth = viewport.width;
    builtHeight = viewport.height;
    picturesBuilt = Object.keys(read).length;
    generation += 1;
    flightPlaced = false;
    flightPending = false;
    flightFailed = false;
    renderer.setFlight(null);
    const sizes = roadSizes(stretch.stops, stretch.sources);
    layout = layoutStretch(stretch.stops, sizes, viewport);
    const world = buildStretchWorld(tier, { road: ambient.code, stops: stretch.sources }, 1, { stops: stretch.stops, layout, word: stretch.word }, read);
    const placed = renderer.setShapes(world.map((part) => part.shape));
    // The ground and the mist under the road, as on the home's (Chris, 2026-11-17: "all the inner pages need the grid and fog").
    surroundings?.stretch(layout.path);
    leadRange = placed[world.findIndex((part) => part.name === `landmark:${stretch.lead.id}`)] ?? null;
    unfinished = null;
    world.forEach((part, i) => {
      if (part.cursor === undefined || !part.stopId) return;
      const stop = stretch.stops.find((s) => s.id === part.stopId);
      const landmark = layout?.landmarks.find((l) => l.stopId === part.stopId);
      if (!stop?.excerptId || !landmark) return;
      unfinished = { start: placed[i].start, cursor: part.cursor, code: stretch.sources[stop.excerptId], center: landmark.center, facing: landmark.facing, lead: stop === stretch.lead };
    });
    // Each screen landmark's picture, read once; the stretch is rebuilt as they arrive.
    for (const stop of stretch.stops) {
      const src = screenOf(stop);
      if (!src || read[stop.id]) continue;
      readPicture(src).then((pixels) => {
        if (pixels) read[stop.id] = pixels;
      });
    }
  };

  /**
   * Resolves the lead's code onto the headline and places it in the world: from the lead's face at
   * rest, laid out as an editor, to the headline's lines where they stand once the spacer has scrolled
   * away, on the lead's plane through the camera at rest.
   * @param {Stretch} stretch @param {HTMLElement} target @param {{ width: number, height: number }} viewport
   */
  const placeFlight = (stretch, target, viewport) => {
    flightPending = true;
    const mine = generation;
    const { font } = headlineText(target);
    document.fonts
      .load(font)
      .catch(() => [])
      .then(() => {
        const spacer = document.querySelector('[data-world-stretch]');
        if (mine !== generation || !layout || !spacer || !stretch.lead.excerptId) return;
        const { text, fontPx, align } = headlineText(target);
        const code = stretch.sources[stretch.lead.excerptId];
        const lead = layout.landmarks[layout.landmarks.length - 1];
        const rest = cameraAt(1, layout.keys);
        const face = landmarkRect(rest, viewport, lead);
        const full = editorSize(code);
        const scale = Math.min(1, face.width / full.w, face.height / full.h);
        const size = editorSize(code, scale);
        // Where the headline stands once the spacer has scrolled away.
        const end = spacer.getBoundingClientRect().bottom;
        const box = target.getBoundingClientRect();
        const resolved = resolveTransform(
          {
            key: `stretch:${stretch.id}`,
            code,
            sourceBox: { x: face.left + (face.width - size.w) / 2, y: face.top + (face.height - size.h) / 2, ...size },
            codeScale: scale,
            target: { kind: 'text', text, font, color: [1, 1, 1], align },
            targetBox: { x: box.left, y: box.top - end, w: box.width, h: box.height },
            step: Math.max(3, Math.round(fontPx / STEPS_PER_FONT)),
          },
          { atlas, budget: flightBudgetFor(tier) },
        );
        renderer.setFlight(toWorldFlight(resolved, { camera: rest, viewport, plane: { point: lead.center, normal: lead.facing } }));
        flightPlaced = true;
        flightPending = false;
      })
      .catch(() => {
        if (mine !== generation) return;
        flightPending = false;
        flightFailed = true;
      });
  };

  return {
    /**
     * Draws one frame of a stretch.
     * @param {{ stretch: Stretch, now: number }} frame
     */
    frame({ stretch, now }) {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      // Arriving from another world (the home's, or another stretch) drives here (W5b); a page loaded
      // directly has drawn nothing yet, so it opens on its stretch as before.
      if (stretch !== built && !driving && renderer.lastCamera) {
        const shown = parseFloat(canvas.style.opacity);
        driving = { start: now, from: renderer.lastCamera, shown: Number.isFinite(shown) ? shown : 1 };
      }
      const drive = driving ? driveAt(now - driving.start) : null;
      if (!drive) driving = null;
      if (driving && drive?.half === 'out') {
        // On ahead out of the world it left, still in the renderer, as that world fades.
        canvas.dataset.drive = 'out';
        const opacity = driving.shown * drive.alpha;
        canvas.style.opacity = opacity.toFixed(3);
        if (opacity > 0) renderer.render(driveCamera(driving.from, drive.travel), now);
        else renderer.lastCamera = driveCamera(driving.from, drive.travel);
        return;
      }
      if (drive) canvas.dataset.drive = 'in';
      else delete canvas.dataset.drive;
      if (stretch !== built || viewport.width !== builtWidth || viewport.height !== builtHeight || Object.keys(read).length !== picturesBuilt) build(stretch, viewport);
      const data = canvas.dataset;
      data.page = `stretch:${stretch.id}`;
      for (const key of ['road', 'section', 'landed', 'restRect', 'editor', 'progress']) delete data[key];
      if (scrim) scrim.style.opacity = '0';
      const spacer = document.querySelector('[data-world-stretch]');
      if (!spacer || !layout) {
        canvas.style.opacity = '0';
        return;
      }
      const y = window.scrollY;
      const box = spacer.getBoundingClientRect();
      const from = box.top + y;
      const length = Math.max(1, box.height);
      const p = clamp01((y - from) / length);
      // In to the road's start from behind it, while the drive plays.
      const camera = drive ? driveCamera(cameraAt(p, layout.keys), drive.travel) : cameraAt(p, layout.keys);

      // The page waits for its headline's landing, so it does not rise over the world meanwhile; a new
      // page and its headline are found again.
      const found = /** @type {HTMLElement | null} */ (document.querySelector('main h1'));
      const page = /** @type {HTMLElement | null} */ (spacer.nextElementSibling);
      if (found !== headline || page !== held) {
        restoreHeadline();
        headline = found;
        held = page;
        flightPlaced = false;
        flightPending = false;
        flightFailed = false;
        generation += 1;
        renderer.setFlight(null);
      }
      if (headline && !flightPlaced && !flightPending && !flightFailed) placeFlight(stretch, headline, viewport);
      const landing = clamp01((p - STRETCH.landFrom) / (1 - STRETCH.landFrom));
      if (held) {
        // Hidden until the landing lands (and while it is laid out); as it is without a landing, and
        // whenever the keyboard has moved focus into it, so what has focus can always be seen.
        const shownAsIs = flightFailed || !headline || held.contains(document.activeElement);
        const opacity = shownAsIs ? '' : (p >= 1 ? 1 : smoothstep(FLIGHT_FADE_FROM, 1, landing)).toFixed(3);
        if (held.style.opacity !== opacity) held.style.opacity = opacity;
      }
      const flight = flightPlaced && landing > 0 && landing < 1 ? { progress: landing, fade: 1 - smoothstep(FLIGHT_FADE_FROM, 1, landing) } : undefined;

      // Landmarks passed show their picture: the others once the camera is level, the lead as its code lifts off.
      const others = layout.landmarks.length - 1;
      let passed = 0;
      for (let i = 0; i < others; i += 1) if (p >= (STRETCH.drive * (i + 1)) / layout.landmarks.length) passed = i + 1;
      if (passed === others && p >= STRETCH.landFrom) passed = others + 1;

      /** @type {Array<{ start: number, count: number, amount: number }>} */
      const fades = [];
      if (leadRange) fades.push({ ...leadRange, amount: 1 - smoothstep(STRETCH.landFrom, STRETCH.landFrom + LIFT_SHARE, p) });
      /** @type {{ index: number, position: Vec3, visible: boolean } | undefined} */
      let cursor;
      if (unfinished) {
        const its = unfinished;
        const chars = Math.round(TYPED_TO * its.code.length);
        const drawn = inkBefore(its.code, chars);
        fades.push({ start: its.start + drawn, count: its.cursor - drawn, amount: 0 });
        const lifted = its.lead && p >= STRETCH.landFrom;
        cursor = {
          index: its.start + its.cursor,
          position: slabCaret(its.code, chars, { center: its.center, facing: its.facing }),
          visible: !lifted && Math.floor(now / BLINK_MS) % 2 === 0,
        };
      }

      // The world fades out over the end of the landing, so the headline lands on today's page, and is
      // not drawn past the stretch.
      const shown = (y > from + length ? 0 : 1 - smoothstep(WORLD_FADE_FROM, 1, landing)) * (drive ? drive.alpha : 1);
      canvas.style.opacity = shown.toFixed(3);
      surroundings?.frame({ camera, now, aspect: viewport.width / viewport.height, shown: 1 });
      if (shown > 0) renderer.render(camera, now, { fades, cursor, flight, passed, underlay: surroundings?.underlay, haze: surroundings?.haze });

      data.stretchProgress = p.toFixed(2);
      if (flight) data.flight = `stretch:${stretch.id}`;
      else delete data.flight;
    },

    /** Leaves the stretch: its page shown again, its flight gone, any drive here dropped, its world rebuilt next time. */
    release() {
      driving = null;
      delete canvas.dataset.drive;
      restoreHeadline();
      renderer.setFlight(null);
      built = null;
      generation += 1;
      delete canvas.dataset.stretchProgress;
      delete canvas.dataset.flight;
    },
  };
}
