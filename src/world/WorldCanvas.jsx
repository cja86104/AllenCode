// @ts-check
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ATLAS_CELL, ATLAS_FONT, ATLAS_FONT_FAMILY, collectGlyphs, createGlyphAtlas, loadAtlasFont } from '../field/glyphAtlas.js';
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { buildWorld } from './shapes.js';
import { cameraAt, frameCamera } from './camera.js';
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

/**
 * The world's canvas and frame loop (Code World W1.2), hosted by the lab and the home page: the
 * renderer and its glyph atlas (drawn once the atlas's exact face has loaded), the camera along the
 * journey, framed for the screen's shape, and, for a host that has one, the landmark's hand-over.
 * The host says how far along the journey the visitor is (`getProgress`) and hears every frame
 * (`onFrame`) to move its own words, rail and screens. `ownScroll` steps Lenis from this loop for a
 * host without the site's `ScrollEngine`. Anything that stops the world (no WebGL2, a lost
 * context) calls `onFail`, and the host shows its plain journey.
 *
 * @param {{
 *   getProgress: () => number,
 *   tier: 'low' | 'mid' | 'high',
 *   keys?: ReadonlyArray<CameraKey>,
 *   ownScroll?: boolean,
 *   landmarkResolve?: (progress: number) => number,
 *   onFrame?: (frame: WorldFrame) => void,
 *   onMeter?: (report: MeterReport) => void,
 *   onFail: () => void,
 * }} props
 */
export default function WorldCanvas({ getProgress, tier, keys, ownScroll = false, landmarkResolve, onFrame, onMeter, onFail }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  // The latest callbacks and journey, read by the frame loop without restarting it.
  const latest = useRef({ getProgress, keys, landmarkResolve, onFrame, onMeter, onFail });
  useIsomorphicLayoutEffect(() => {
    latest.current = { getProgress, keys, landmarkResolve, onFrame, onMeter, onFail };
  });
  const metered = Boolean(onMeter);

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
    const meter = createFrameMeter();
    const root = document.documentElement;
    const lenis = ownScroll ? new Lenis() : null;
    if (lenis) root.dataset.scrollEngine = 'on';

    const resize = () => renderer?.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2));
    const lost = (/** @type {Event} */ event) => {
      event.preventDefault();
      latest.current.onFail();
    };

    const start = async () => {
      // The atlas is drawn at weight 500, so wait for that exact face, as the field's stage does;
      // waiting for the family alone loaded weight 400 and the atlas fell back to a serif (Task P2).
      await loadAtlasFont(ATLAS_FONT_FAMILY);
      const faces = await document.fonts.load(ATLAS_FONT).catch(() => []);
      if (cancelled) return;
      canvas.dataset.atlasFont = faces.length > 0 ? 'loaded' : 'fallback';
      try {
        const atlas = createGlyphAtlas(collectGlyphs([gate.code, ambient.code, underfire.code, SIGN_LABELS]), { cell: ATLAS_CELL, font: ATLAS_FONT });
        renderer = createWorldRenderer(canvas, atlas);
        const world = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1);
        const ranges = renderer.setShapes(world.map((part) => part.shape));
        landmarkRange = ranges[world.findIndex((part) => part.name === 'landmark')] ?? null;
      } catch {
        latest.current.onFail();
        return;
      }
      resize();
      const loop = (/** @type {number} */ now) => {
        if (cancelled || !renderer) return;
        lenis?.raf(now);
        const { getProgress: progressOf, keys: journeyKeys, landmarkResolve: resolveOf, onFrame: report } = latest.current;
        const progress = Math.min(1, Math.max(0, progressOf()));
        const camera = frameCamera(cameraAt(progress, journeyKeys), window.innerWidth / window.innerHeight);
        const resolved = resolveOf ? resolveOf(progress) : 0;
        renderer.render(camera, now, resolveOf && landmarkRange ? { ...landmarkRange, amount: 1 - resolved } : undefined);
        if (resolveOf) canvas.dataset.landmarkFade = (1 - resolved).toFixed(2);
        report?.({ progress, camera, resolved, now });
        meter.tick(now);
        canvas.dataset.progress = progress.toFixed(3);
        canvas.dataset.ready = 'true';
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
      if (metered) interval = window.setInterval(() => latest.current.onMeter?.(meter.report()), 500);
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
  }, [tier, ownScroll, metered]);

  return <canvas ref={canvasRef} data-world aria-hidden="true" className="fixed inset-0 h-screen w-screen" />;
}
