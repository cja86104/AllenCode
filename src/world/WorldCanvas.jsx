// @ts-check
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ATLAS_CELL, ATLAS_FONT, ATLAS_FONT_FAMILY, collectGlyphs, createGlyphAtlas, loadAtlasFont } from '../field/glyphAtlas.js';
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { buildRoadWorld, buildWorld, inkBefore, slabCaret } from './shapes.js';
import { cameraAt, frameCamera } from './camera.js';
import { commitsAt, handoverAt, TYPED_FROM, TYPED_TO, typedAt } from './journey.js';
import { landmarkRect } from './landmark.js';
import { roadGlyphs } from './route.js';
import { worldFrame } from './worldFrame.js';
import { createWorldRenderer } from './worldRenderer.js';
import { createFrameMeter } from './frameMeter.js';
import { useIsomorphicLayoutEffect } from '../ssr/useHydrated.js';

/** @typedef {import('./camera.js').CameraKey} CameraKey */
/** @typedef {{ eye: [number, number, number], target: [number, number, number], fov: number }} Camera */
/** @typedef {{ progress: number, camera: Camera, resolved: number, now: number }} WorldFrame */
/** @typedef {{ frames: number, medianMs: number, p95Ms: number }} MeterReport */

/** The world is built only from approved code (spec section 5). */
export const WORLD_SOURCES_APPROVED = Boolean(gate.approved && ambient.approved && underfire.approved);
const SIGN_LABELS = 'business/family/';
/** The unfinished file's cursor blinks on and off this often, as an editor's does. */
const BLINK_MS = 530;

/**
 * The world's canvas and frame loop (Code World W1.2), hosted by the lab and the home page: the
 * renderer and its glyph atlas (drawn once the atlas's exact face has loaded), the camera along the
 * journey, framed for the screen's shape, and, for a host that has one, the landmark's hand-over.
 * The host says how far along the journey the visitor is (`getProgress`) and hears every frame
 * (`onFrame`) to move its own words, rail and screens. `ownScroll` steps Lenis from this loop for a
 * host without the site's `ScrollEngine`. Anything that stops the world (no WebGL2, a lost
 * context) calls `onFail`, and the host shows its plain journey.
 *
 * With a `route` (the home page, W2.4) it draws the visitor's road: rebuilt in place when the door
 * changes, each landmark handing over as the camera rests at it, Crew Advisors typing with its
 * cursor; and each frame it tells the page (`worldFrame`) where the handing-over landmark is on
 * screen, how much is typed and how many commits are passed. Without one (the lab) it draws the
 * prototype's world along `keys`.
 *
 * @param {{
 *   getProgress: () => number,
 *   tier: 'low' | 'mid' | 'high',
 *   route?: import('./route.js').Route,
 *   keys?: ReadonlyArray<CameraKey>,
 *   ownScroll?: boolean,
 *   landmarkResolve?: (progress: number) => number,
 *   onFrame?: (frame: WorldFrame) => void,
 *   onMeter?: (report: MeterReport) => void,
 *   onFail: () => void,
 * }} props
 */
export default function WorldCanvas({ getProgress, tier, route, keys, ownScroll = false, landmarkResolve, onFrame, onMeter, onFail }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  // The latest callbacks and journey, read by the frame loop without restarting it.
  const latest = useRef({ getProgress, route, keys, landmarkResolve, onFrame, onMeter, onFail });
  useIsomorphicLayoutEffect(() => {
    latest.current = { getProgress, route, keys, landmarkResolve, onFrame, onMeter, onFail };
  });
  const metered = Boolean(onMeter);
  // A host with a route may take a road at any time, so its atlas holds every road's characters.
  const routed = route !== undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    let frame = 0;
    let interval = 0;
    /** @type {ReturnType<typeof createWorldRenderer> | null} */
    let renderer = null;
    /** @type {{ start: number, count: number } | null} */
    let landmarkRange = null;
    /** The road the shapes were built for (undefined: not built yet), and each stop's range. */
    /** @type {import('./route.js').Route['road'] | undefined} */
    let builtFor;
    /** @type {Map<string, { start: number, count: number }>} */
    let stopRanges = new Map();
    /** @type {{ start: number, cursor: number, code: string, landmark: import('./roadLayout.js').Landmark, from: number } | null} */
    let unfinished = null;
    const meter = createFrameMeter();
    const root = document.documentElement;
    const lenis = ownScroll ? new Lenis() : null;
    if (lenis) root.dataset.scrollEngine = 'on';

    const resize = () => renderer?.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2));
    const lost = (/** @type {Event} */ event) => {
      event.preventDefault();
      latest.current.onFail();
    };

    /**
     * Builds the world's shapes for a road (or the prototype's world without one) and notes where
     * each part landed in the renderer's buffer.
     * @param {import('./route.js').Route['road']} road
     */
    const build = (road) => {
      if (!renderer) return;
      builtFor = road;
      stopRanges = new Map();
      unfinished = null;
      landmarkRange = null;
      if (!road) {
        const world = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1);
        const ranges = renderer.setShapes(world.map((part) => part.shape));
        landmarkRange = ranges[world.findIndex((part) => part.name === 'landmark')] ?? null;
        return;
      }
      const world = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: road.sources }, 1, { stops: road.stops, layout: road.layout });
      const ranges = renderer.setShapes(world.map((part) => part.shape));
      world.forEach((part, i) => {
        if (!part.stopId) return;
        stopRanges.set(part.stopId, ranges[i]);
        const stop = road.stops.find((s) => s.id === part.stopId);
        const landmark = road.layout.landmarks.find((l) => l.stopId === part.stopId);
        if (part.cursor !== undefined && stop?.excerptId && landmark) {
          const journeyLandmark = latest.current.route?.journey.landmarks.find((l) => l.stopId === part.stopId);
          unfinished = { start: ranges[i].start, cursor: part.cursor, code: road.sources[stop.excerptId], landmark, from: journeyLandmark?.from ?? 0 };
        }
      });
    };

    const start = async () => {
      // The atlas is drawn at weight 500, so wait for that exact face, as the field's stage does;
      // waiting for the family alone loaded weight 400 and the atlas fell back to a serif (Task P2).
      await loadAtlasFont(ATLAS_FONT_FAMILY);
      const faces = await document.fonts.load(ATLAS_FONT).catch(() => []);
      if (cancelled) return;
      canvas.dataset.atlasFont = faces.length > 0 ? 'loaded' : 'fallback';
      try {
        const glyphSources = [gate.code, ambient.code, underfire.code, SIGN_LABELS, ...(routed ? [roadGlyphs()] : [])];
        const atlas = createGlyphAtlas(collectGlyphs(glyphSources), { cell: ATLAS_CELL, font: ATLAS_FONT });
        renderer = createWorldRenderer(canvas, atlas);
        build(latest.current.route?.road ?? null);
      } catch {
        latest.current.onFail();
        return;
      }
      resize();
      const loop = (/** @type {number} */ now) => {
        if (cancelled || !renderer) return;
        lenis?.raf(now);
        const { getProgress: progressOf, route: current, keys: hostKeys, landmarkResolve: resolveOf, onFrame: report } = latest.current;
        const road = current?.road ?? null;
        if (current && road !== builtFor) build(road);
        const progress = Math.min(1, Math.max(0, progressOf()));
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const camera = frameCamera(cameraAt(progress, current ? current.journey.keys : hostKeys), viewport.width / viewport.height);
        if (current) {
          drawRoad(current, progress, camera, viewport, now);
        } else {
          const resolved = resolveOf ? resolveOf(progress) : 0;
          renderer.render(camera, now, resolveOf && landmarkRange ? { ...landmarkRange, amount: 1 - resolved } : undefined);
          if (resolveOf) canvas.dataset.landmarkFade = (1 - resolved).toFixed(2);
          report?.({ progress, camera, resolved, now });
        }
        meter.tick(now);
        canvas.dataset.progress = progress.toFixed(3);
        canvas.dataset.ready = 'true';
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
      if (metered) interval = window.setInterval(() => latest.current.onMeter?.(meter.report()), 500);
    };

    /**
     * One frame of the home's world: the handing-over landmark faded toward its real thing, Crew
     * Advisors' untyped code hidden and its cursor where the typing has reached, then the frame told
     * to the page.
     * @param {import('./route.js').Route} current
     * @param {number} progress
     * @param {{ eye: [number, number, number], target: [number, number, number], fov: number }} camera
     * @param {{ width: number, height: number }} viewport
     * @param {number} now
     */
    const drawRoad = (current, progress, camera, viewport, now) => {
      if (!renderer) return;
      const { journey } = current;
      const handing = handoverAt(journey, progress);
      const range = handing ? stopRanges.get(handing.stopId) : undefined;
      const landmark = handing ? journey.landmarks.find((l) => l.stopId === handing.stopId) : undefined;
      const handover = handing && range && landmark ? { stopId: handing.stopId, amount: handing.amount, rect: landmarkRect(camera, viewport, landmark) } : null;

      const typed = typedAt(journey, progress);
      /** @type {{ index: number, position: [number, number, number], visible: boolean } | undefined} */
      let cursor;
      /** @type {{ start: number, count: number } | undefined} */
      let hidden;
      if (unfinished) {
        // Before its stop the file shows where the typing starts; after it, where it stopped.
        const share = typed ?? (progress < unfinished.from ? TYPED_FROM : TYPED_TO);
        const chars = Math.round(share * unfinished.code.length);
        const drawn = inkBefore(unfinished.code, chars);
        hidden = { start: unfinished.start + drawn, count: unfinished.cursor - drawn };
        cursor = {
          index: unfinished.start + unfinished.cursor,
          position: slabCaret(unfinished.code, chars, { center: unfinished.landmark.center, facing: unfinished.landmark.facing }),
          visible: Math.floor(now / BLINK_MS) % 2 === 0,
        };
      }

      renderer.render(camera, now, handover && range ? { ...range, amount: 1 - handover.amount } : undefined, cursor, hidden);

      const commits = commitsAt(journey, progress);
      const data = canvas.dataset;
      if (current.road) data.road = current.road.door;
      else delete data.road;
      if (handover) {
        data.handoverStop = handover.stopId;
        data.handover = handover.amount.toFixed(2);
        const { left, top, width, height } = handover.rect;
        data.handoverRect = [left, top, width, height].map((v) => v.toFixed(1)).join(',');
      } else {
        delete data.handoverStop;
        delete data.handover;
        delete data.handoverRect;
      }
      if (typed === null) delete data.typed;
      else data.typed = typed.toFixed(3);
      worldFrame.publish({ progress, handover, typed, commits });
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('webglcontextlost', lost);
    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', lost);
      renderer?.destroy();
      if (lenis) {
        lenis.destroy();
        delete root.dataset.scrollEngine;
      }
      delete canvas.dataset.ready;
    };
  }, [tier, ownScroll, metered, routed]);

  return <canvas ref={canvasRef} data-world aria-hidden="true" className="fixed inset-0 h-screen w-screen" />;
}
