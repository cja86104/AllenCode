// @ts-check
import { useEffect, useRef } from 'react';
import { ATLAS_CELL, ATLAS_FONT, ATLAS_FONT_FAMILY, collectGlyphs, createGlyphAtlas, loadAtlasFont } from '../field/glyphAtlas.js';
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { roadGlyphs } from './route.js';
import { createHomeWorld } from './homeWorld.js';
import { createWorldRenderer } from './worldRenderer.js';
import { createFrameMeter } from './frameMeter.js';
import { useIsomorphicLayoutEffect } from '../ssr/useHydrated.js';

/** @typedef {{ frames: number, medianMs: number, p95Ms: number }} MeterReport */

/** The world is built only from approved code (spec section 5). */
export const WORLD_SOURCES_APPROVED = Boolean(gate.approved && ambient.approved && underfire.approved);
const SIGN_LABELS = 'business/family/';

/**
 * The world's canvas and frame loop (Code World W1.2), hosted by the world layer: the renderer and its
 * glyph atlas (drawn once the atlas's exact face has loaded). Anything that stops the world (no WebGL2,
 * a lost context) calls `onFail`, and the site shows its plain pages.
 *
 * On the home page the frame is the home's world's (`createHomeWorld`): the camera follows the page's
 * track, today's chapters play over it, and their flights land in it. A scrim behind a resting
 * chapter's words is drawn with the canvas. On an inner page with a stretch (`getPage`, Code World W5a)
 * the frame is the stretch's world (`createStretch`, passed in so its code stays out of this chunk);
 * the canvas and renderer are kept from page to page, and a page with neither is not drawn. (The lab's
 * single-scene mode went with the lab, W7.)
 *
 * @param {{
 *   tier: 'low' | 'mid' | 'high',
 *   home: {
 *     route: import('./route.js').Route,
 *     getTrack: () => import('./homeWorld.js').TrackState | null,
 *     getPage: () => 'home' | import('./stretches.js').Stretch | null,
 *     createStretch: typeof import('./stretchWorld.js').createStretchWorld,
 *     createSurroundings?: typeof import('./surroundings.js').createSurroundings,
 *   },
 *   onMeter?: (report: MeterReport) => void,
 *   onFail: () => void,
 * }} props
 */
export default function WorldCanvas({ tier, home, onMeter, onFail }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  const scrimRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  // The latest callbacks and journey, read by the frame loop without restarting it.
  const latest = useRef({ home, onMeter, onFail });
  useIsomorphicLayoutEffect(() => {
    latest.current = { home, onMeter, onFail };
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
    /** @type {ReturnType<typeof createHomeWorld> | null} */
    let homeWorld = null;
    /** @type {ReturnType<typeof import('./stretchWorld.js').createStretchWorld> | null} */
    let stretchWorld = null;
    /** The ground, the mist and the ripples, shared by the home's world and the stretches (2026-11-17). */
    /** @type {ReturnType<typeof import('./surroundings.js').createSurroundings> | null} */
    let surroundings = null;
    /** What the last frame drew: the home's world, a stretch, or nothing. */
    /** @type {'home' | 'stretch' | 'none'} */
    let drew = 'home';
    /** @type {{ indexOf: (char: string) => number } | null} */
    let glyphs = null;
    const meter = createFrameMeter();

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
        // The home may take a road at any time, so the atlas holds every road's characters.
        const glyphSources = [gate.code, ambient.code, underfire.code, SIGN_LABELS, roadGlyphs()];
        const atlas = createGlyphAtlas(collectGlyphs(glyphSources), { cell: ATLAS_CELL, font: ATLAS_FONT });
        renderer = createWorldRenderer(canvas, atlas);
        glyphs = atlas;
        surroundings = latest.current.home.createSurroundings?.({ tier, renderer, canvas }) ?? null;
        homeWorld = createHomeWorld({ renderer, atlas, tier, canvas, scrim: scrimRef.current, surroundings });
      } catch {
        latest.current.onFail();
        return;
      }
      resize();
      const loop = (/** @type {number} */ now) => {
        if (cancelled || !renderer) return;
        const { home: host } = latest.current;
        if (homeWorld) {
          const page = host.getPage();
          if (page && page !== 'home' && glyphs) {
            stretchWorld ??= host.createStretch({ renderer, atlas: glyphs, tier, canvas, scrim: scrimRef.current, surroundings });
            if (drew === 'home') homeWorld.reset();
            drew = 'stretch';
            stretchWorld.frame({ stretch: page, now });
          } else {
            if (drew === 'stretch') stretchWorld?.release();
            if (page === 'home') {
              if (drew === 'none') homeWorld.reset();
              drew = 'home';
              homeWorld.frame({ route: host.route, state: host.getTrack(), now });
            } else {
              drew = 'none';
              canvas.style.opacity = '0';
            }
          }
        }
        meter.tick(now);
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
      // A headline a stretch was holding back reads again; the ground's layer and listener let go.
      stretchWorld?.release();
      homeWorld?.destroy();
      renderer?.destroy();
      delete canvas.dataset.ready;
    };
  }, [tier, metered]);

  return (
    <>
      <canvas ref={canvasRef} data-world aria-hidden="true" className="fixed inset-0 h-screen w-screen" />
      {/* Behind a resting chapter's words, so they read over the world: from the left on a screen at
          least as wide as tall (words left, screen right), from the top otherwise (words above). */}
      <div
        ref={scrimRef}
        data-world-scrim
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-night/85 via-night/30 to-transparent to-45% transition-opacity duration-500 wide:bg-gradient-to-r wide:via-night/40 wide:to-55%"
      />
    </>
  );
}
