// @ts-check
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { fieldBus } from '../field/fieldBus.js';
import { loadTarget } from '../field/loadTarget.js';
import { resolveTransform } from '../field/resolveTransform.js';
import { products } from '../data/products.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { loopOf } from '../scenes/ProductChapter.jsx';
import { buildRoadWorld, buildWorld, inkBefore, slabCaret } from './shapes.js';
import { TYPED_FROM, TYPED_TO } from './journey.js';
import { landmarkRect } from './landmark.js';
import { flightBudgetFor, toWorldFlight } from './worldFlight.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./route.js').Route} Route */
/** @typedef {import('./worldTrack.js').TrackSection} TrackSection */
/** @typedef {{ track: ReturnType<typeof import('./worldTrack.js').buildTrack>, sections: TrackSection[], version: number }} TrackState */
/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */

/** The unfinished file's cursor blinks on and off this often, as an editor's does. */
const BLINK_MS = 530;
/** As the field fades a flight while the chapter's real screen takes over (`FieldStage`). */
const FLIGHT_FADE_FROM = 0.92;
/** A landmark's code fades under its chapter's box over this share of the chapter's rest. */
const SETTLE_SHARE = 0.15;
/** The world's editor appears over this much scroll after the gate, in screens. */
const EDITOR_APPEARS = 0.5;
/** Where the world's editor (the empty file) stands: the gate's flight lands on its plane. */
const EDITOR_PLANE = Object.freeze({ point: /** @type {Vec3} */ ([0, 1.6, 0]), normal: /** @type {Vec3} */ ([0, 0, 1]) });
/** Landmark screens are read this wide for their pictures in characters. */
const PICTURE_WIDTH = 320;

/** @param {number} a @param {number} b @param {number} x */
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** Each landmark's screen, read once per visit. @type {Map<string, Promise<Pixels | null>>} */
const pictures = new Map();

/**
 * Reads a screen's pixels at `PICTURE_WIDTH`, for its landmark's picture in characters.
 * @param {string} src
 * @returns {Promise<Pixels | null>}
 */
function readPicture(src) {
  const known = pictures.get(src);
  if (known) return known;
  const reading = (async () => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    await img.decode();
    const width = PICTURE_WIDTH;
    const height = Math.max(1, Math.round((PICTURE_WIDTH * img.naturalHeight) / Math.max(1, img.naturalWidth)));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return { data: ctx.getImageData(0, 0, width, height).data, width, height };
  })().catch(() => null);
  pictures.set(src, reading);
  return reading;
}

/**
 * The screen a road stop resolves into: a product's loop poster or a service's screen.
 * @param {import('./roads.js').RoadStop} stop
 */
function screenOf(stop) {
  if (stop.kind === 'product') {
    const product = products.find((p) => p.slug === stop.id);
    return product ? (loopOf(product)?.poster ?? null) : null;
  }
  if (stop.kind === 'service') return serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)]?.src ?? null;
  return null;
}

/**
 * The home page's world (Code World R4): today's chapters play over it, and it draws what they ask of
 * the field. Each frame it builds the road for the door taken (each screen landmark's picture added
 * once read), places and draws the chapter's flight (claimed through `fieldBus`, as the chapters claim
 * it from the field) on the plane of its landmark through the camera's rest there (the gate's on the
 * world's editor), keeps the world's editor hidden while the gate plays, fades the resting landmark's
 * code under its chapter's box, keeps Crew Advisors' untyped code hidden with its cursor at the caret,
 * and shows the picture of every landmark already passed. It marks the canvas for tests and shows the
 * scrim behind a chapter's words.
 * @param {{
 *   renderer: ReturnType<typeof import('./worldRenderer.js').createWorldRenderer>,
 *   atlas: { indexOf: (char: string) => number },
 *   tier: 'low' | 'mid' | 'high',
 *   canvas: HTMLCanvasElement,
 *   scrim: HTMLElement | null,
 * }} deps
 */
export function createHomeWorld({ renderer, atlas, tier, canvas, scrim }) {
  /** The road built for (undefined: nothing yet), and how many pictures it had. */
  /** @type {Route['road'] | undefined} */
  let builtFor;
  let picturesBuilt = -1;
  /** @type {Record<string, Pixels>} */
  const read = {};
  /** @type {Map<string, { start: number, count: number }>} */
  let ranges = new Map();
  /** @type {{ start: number, count: number } | null} */
  let editor = null;
  /** @type {{ start: number, cursor: number, code: string, center: Vec3, facing: Vec3, stopId: string } | null} */
  let unfinished = null;

  /** The flight claimed through the bus, once resolved, and the track version it was placed for. */
  /** @type {string | null} */
  let claimed = null;
  /** @type {ReturnType<typeof resolveTransform> | null} */
  let resolved = null;
  let placedFor = -1;
  let flightKey = '';

  /** @param {Route['road']} road */
  const build = (road) => {
    builtFor = road;
    picturesBuilt = Object.keys(read).length;
    ranges = new Map();
    unfinished = null;
    if (!road) {
      const world = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1);
      const placed = renderer.setShapes(world.map((part) => part.shape));
      editor = placed[world.findIndex((part) => part.name === 'editor')] ?? null;
      return;
    }
    const world = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: road.sources }, 1, { stops: road.stops, layout: road.layout }, read);
    const placed = renderer.setShapes(world.map((part) => part.shape));
    editor = placed[world.findIndex((part) => part.name === 'editor')] ?? null;
    world.forEach((part, i) => {
      if (!part.stopId || !part.name.startsWith('landmark:')) return;
      ranges.set(part.stopId, placed[i]);
      const stop = road.stops.find((s) => s.id === part.stopId);
      const landmark = road.layout.landmarks.find((l) => l.stopId === part.stopId);
      if (part.cursor !== undefined && stop?.excerptId && landmark) {
        unfinished = { start: placed[i].start, cursor: part.cursor, code: road.sources[stop.excerptId], center: landmark.center, facing: landmark.facing, stopId: stop.id };
      }
    });
    // Each screen landmark's picture, read once; the road is rebuilt as they arrive.
    for (const stop of road.stops) {
      const src = screenOf(stop);
      if (!src || read[stop.id]) continue;
      readPicture(src).then((pixels) => {
        if (pixels) read[stop.id] = pixels;
      });
    }
  };

  /**
   * Places the claimed flight on its plane through the camera's rest for it.
   * @param {Route} route @param {TrackState} state @param {{ width: number, height: number }} viewport
   */
  const place = (route, state, viewport) => {
    if (!resolved || !claimed) return;
    const prefix = claimed.split(':')[0];
    /** @type {{ point: Vec3, normal: Vec3 } | null} */
    let plane = null;
    /** @type {TrackSection | undefined} */
    let section;
    if (prefix === 'gate') {
      section = state.sections.find((s) => s.kind === 'gate');
      plane = EDITOR_PLANE;
    } else {
      const landmark = route.road?.layout.landmarks.find((l) => l.stopId === prefix);
      section = state.sections.find((s) => s.kind === 'rest' && s.stopId === prefix);
      if (landmark) plane = { point: landmark.center, normal: landmark.facing };
    }
    if (!plane || !section) return;
    renderer.setFlight(toWorldFlight(resolved, { camera: state.track.cameraAt(section.from), viewport, plane }));
    placedFor = state.version;
    flightKey = claimed;
  };

  return {
    /**
     * Draws one frame of the home's world.
     * @param {{ route: Route, state: TrackState | null, now: number }} frame
     */
    frame({ route, state, now }) {
      const road = route.road;
      if (road !== builtFor || (road && Object.keys(read).length !== picturesBuilt)) build(road);
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const y = window.scrollY;
      const camera = state ? state.track.cameraAt(y) : { eye: /** @type {Vec3} */ ([0, 1.6, 7]), target: /** @type {Vec3} */ ([0, 1.6, 0]), fov: 45 };
      const section = state ? state.track.sectionAt(y) : null;
      const sections = state?.sections ?? [];

      // The flight the page has claimed: resolved as the field resolves it, then placed in the world.
      const bus = fieldBus.get();
      const key = bus.transform?.key ?? null;
      if (key !== claimed) {
        claimed = key;
        resolved = null;
        placedFor = -1;
        flightKey = '';
        renderer.setFlight(null);
        const spec = bus.transform;
        if (spec) {
          loadTarget(spec)
            .then((image) => {
              if (claimed !== spec.key) return;
              resolved = resolveTransform(spec, { atlas, budget: flightBudgetFor(tier), image });
            })
            .catch(() => {
              if (claimed === spec.key) claimed = null;
            });
        }
      }
      if (resolved && state && placedFor !== state.version) place(route, state, viewport);
      const progress = bus.transformProgress;
      const flight = flightKey && progress > 0 ? { progress, fade: 1 - smoothstep(FLIGHT_FADE_FROM, 1, progress) } : undefined;

      /** @type {Array<{ start: number, count: number, amount: number }>} */
      const fades = [];
      // The world's editor stays hidden while the gate plays, and appears as the visitor scrolls on.
      const gateSection = sections.find((s) => s.kind === 'gate');
      const editorShown = gateSection ? clamp01((y - gateSection.to) / (EDITOR_APPEARS * viewport.height)) : 1;
      if (editor && gateSection) fades.push({ ...editor, amount: editorShown });
      // The resting landmark's code fades under its chapter's box: the box is the code now.
      const resting = section?.kind === 'rest' && section.stopId ? ranges.get(section.stopId) : undefined;
      if (resting && section) fades.push({ ...resting, amount: 1 - clamp01((y - section.from) / (SETTLE_SHARE * Math.max(1, section.to - section.from))) });
      // Crew Advisors: its code typed where its chapter starts before it, where it stopped after.
      /** @type {{ index: number, position: Vec3, visible: boolean } | undefined} */
      let cursor;
      if (unfinished) {
        const its = unfinished;
        const rest = sections.find((s) => s.kind === 'rest' && s.stopId === its.stopId);
        const share = rest && y >= rest.from ? TYPED_TO : TYPED_FROM;
        const chars = Math.round(share * its.code.length);
        const drawn = inkBefore(its.code, chars);
        fades.push({ start: its.start + drawn, count: its.cursor - drawn, amount: 0 });
        cursor = {
          index: its.start + its.cursor,
          position: slabCaret(its.code, chars, { center: its.center, facing: its.facing }),
          visible: Math.floor(now / BLINK_MS) % 2 === 0,
        };
      }

      // Landmarks passed (their chapter's rest above the scroll) show their picture.
      /** @type {string[]} */
      const landed = [];
      let passed = 0;
      road?.layout.landmarks.forEach((landmark, i) => {
        const rest = sections.find((s) => s.kind === 'rest' && s.stopId === landmark.stopId);
        if (rest && y > rest.to) {
          passed = i + 1;
          if (read[landmark.stopId]) landed.push(landmark.stopId);
        }
      });

      renderer.render(camera, now, { fades, cursor, flight, passed });

      const data = canvas.dataset;
      if (road) data.road = road.door;
      else delete data.road;
      data.section = section ? `${section.kind}${section.stopId ? `:${section.stopId}` : ''}` : 'road';
      if (flight) {
        data.flight = flightKey;
        data.flightProgress = progress.toFixed(3);
      } else {
        delete data.flight;
        delete data.flightProgress;
      }
      const landmark = section?.kind === 'rest' ? road?.layout.landmarks.find((l) => l.stopId === section.stopId) : undefined;
      if (landmark) {
        const rect = landmarkRect(camera, viewport, landmark);
        data.restRect = [rect.left, rect.top, rect.width, rect.height].map((v) => v.toFixed(1)).join(',');
      } else {
        delete data.restRect;
      }
      data.landed = landed.join(',');
      data.editor = editorShown.toFixed(2);
      data.progress = state ? state.track.progressAt(y).toFixed(3) : '0.000';
      if (scrim) scrim.style.opacity = section?.kind === 'rest' ? '1' : '0';
      return camera;
    },
  };
}
