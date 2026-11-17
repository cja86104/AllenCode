// @ts-check
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { fieldBus } from '../field/fieldBus.js';
import { loadTarget } from '../field/loadTarget.js';
import { resolveTransform } from '../field/resolveTransform.js';
import { buildRoadWorld, buildWorld, inkBefore, slabCaret } from './shapes.js';
import { TYPED_FROM, TYPED_TO } from './journey.js';
import { stopForFlight } from './roads.js';
import { landmarkRect } from './landmark.js';
import { flightBudgetFor, toWorldFlight } from './worldFlight.js';
import { readPicture, screenOf } from './screens.js';

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

/** @param {number} a @param {number} b @param {number} x */
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * The home page's world (Code World R4): today's chapters play over it, and it draws what they ask of
 * the field. Each frame it builds the road for the door taken (each screen landmark's picture added
 * once read), places and draws the chapter's flight (claimed through `fieldBus`, as the chapters claim
 * it from the field) on the plane of its landmark through the camera's rest there (the gate's on the
 * world's editor), keeps the world's editor hidden while the gate plays, fades the resting landmark's
 * code under its chapter's box, keeps Crew Advisors' untyped code hidden with its cursor at the caret,
 * and shows the picture of every landmark already passed. It marks the canvas for tests and shows the
 * scrim behind a chapter's words.
 * With `surroundings` (2026-11-16, passed in from the world layer) the road is built whole once, at its
 * door's world budget, and drawn cut to what stands around the camera, cut again as the camera travels
 * (`surroundings.js`), so a road of any length fits the tier's budget.
 * @param {{
 *   renderer: ReturnType<typeof import('./worldRenderer.js').createWorldRenderer>,
 *   atlas: { indexOf: (char: string) => number },
 *   tier: 'low' | 'mid' | 'high',
 *   canvas: HTMLCanvasElement,
 *   scrim: HTMLElement | null,
 *   surroundings?: ReturnType<typeof import('./surroundings.js').createSurroundings> | null,
 * }} deps
 */
export function createHomeWorld({ renderer, atlas, tier, canvas, scrim, surroundings = null }) {
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
  /** The road's whole world, while it is drawn cut around the camera, and where it was last cut. */
  /** @type {ReturnType<typeof buildRoadWorld> | null} */
  let whole = null;
  /** @type {[number, number] | null} */
  let cutAt = null;

  /** The flight claimed through the bus, once resolved, and the track version it was placed for. */
  /** @type {string | null} */
  let claimed = null;
  /** @type {ReturnType<typeof resolveTransform> | null} */
  let resolved = null;
  let placedFor = -1;
  let flightKey = '';

  /**
   * Draws a road's world (whole, or as cut around the camera), and finds in the buffer the parts each
   * frame needs: the editor, each landmark's range, and the unfinished file's cursor.
   * @param {NonNullable<Route['road']>} road @param {ReturnType<typeof buildRoadWorld>} world
   */
  const draw = (road, world) => {
    ranges = new Map();
    unfinished = null;
    const placed = renderer.setShapes(world.map((part) => part.shape));
    canvas.dataset.cut = String(world.reduce((sum, part) => sum + part.shape.glyphs.length, 0));
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
  };

  /** @param {Route['road']} road */
  const build = (road) => {
    builtFor = road;
    picturesBuilt = Object.keys(read).length;
    ranges = new Map();
    unfinished = null;
    whole = null;
    cutAt = null;
    if (!road) {
      const world = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1);
      const placed = renderer.setShapes(world.map((part) => part.shape));
      editor = placed[world.findIndex((part) => part.name === 'editor')] ?? null;
      surroundings?.opening();
      return;
    }
    const budget = surroundings ? surroundings.worldBudget(road.door) : undefined;
    const world = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: road.sources }, 1, { stops: road.stops, layout: road.layout, budget }, read);
    // Cut around the camera from its first frame on; drawn whole without surroundings.
    if (surroundings) whole = world;
    else draw(road, world);
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
      const stopId = stopForFlight(prefix);
      const landmark = route.road?.layout.landmarks.find((l) => l.stopId === stopId);
      section = state.sections.find((s) => s.kind === 'rest' && s.stopId === stopId);
      if (landmark) plane = { point: landmark.center, normal: landmark.facing };
    }
    if (!plane || !section) return;
    // A pinned rest's camera is still, so its start stands for all of it; a held rest's (your idea, W4)
    // moves with the page, so the flight is placed through the camera where it was launched.
    const at = section.hold === 'visible' ? window.scrollY : section.from;
    renderer.setFlight(toWorldFlight(resolved, { camera: state.track.cameraAt(at), viewport, plane }));
    placedFor = state.version;
    flightKey = claimed;
  };

  return {
    /**
     * Forgets what it built and the flight it placed, so its next frame builds the home's world again
     * (an inner page's stretch drew over the renderer meanwhile, Code World W5a).
     */
    /** Lets go of the surroundings: the cursor's listener and the ground's layer. */
    destroy() {
      surroundings?.destroy();
    },

    reset() {
      builtFor = undefined;
      whole = null;
      cutAt = null;
      picturesBuilt = -1;
      claimed = null;
      resolved = null;
      placedFor = -1;
      flightKey = '';
      renderer.setFlight(null);
    },

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
      // The road cut around the camera, and cut again once it has travelled far enough.
      if (surroundings && whole && road && (!cutAt || Math.hypot(camera.eye[0] - cutAt[0], camera.eye[2] - cutAt[1]) > surroundings.recutAfter)) {
        cutAt = [camera.eye[0], camera.eye[2]];
        draw(road, surroundings.cut(whole, cutAt, road.layout));
      }
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

      // The world fades out over the screen before the brief (W4); faded out, it is not drawn at all.
      const shown = state ? state.track.fadeAt(y) : 1;
      canvas.style.opacity = shown.toFixed(3);
      // The ground and the cursor's ripples beneath it all, shown as the world's editor is (2026-11-16).
      surroundings?.frame({ camera, now, aspect: viewport.width / viewport.height, shown: editorShown });
      if (shown > 0) renderer.render(camera, now, { fades, cursor, flight, passed, underlay: surroundings?.underlay, haze: surroundings?.haze });

      const data = canvas.dataset;
      data.page = 'home';
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
      if (scrim) scrim.style.opacity = section?.kind === 'rest' ? shown.toFixed(3) : '0';
      return camera;
    },
  };
}
