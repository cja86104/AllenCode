// @ts-check
import { useEffect, useRef } from 'react';
import {
  ATLAS_CELL,
  ATLAS_FONT,
  ATLAS_FONT_FAMILY,
  PRINTABLE_ASCII,
  collectGlyphs,
  createGlyphAtlas,
  loadAtlasFont,
} from './glyphAtlas.js';
import { createGlyphRenderer } from './glyphRenderer.js';
import { resolveTransform } from './resolveTransform.js';
import { loadTarget } from './loadTarget.js';
import { createGovernor } from './governor.js';
import { watchContext } from './contextRecovery.js';
import { fieldBus } from './fieldBus.js';
import { excerpts, getExcerpt } from '../content/excerpts/index.js';

/** Device pixel ratio cap: sharper than this costs fill rate without a visible gain. */
const MAX_DPR = 2;
/**
 * Landed characters fade out over the last 8 percent so the scene's real text takes over. At
 * progress 0 nothing is drawn: the scene's DOM shows the code until the flight begins.
 */
const FADE_FROM = 0.92;

/**
 * @param {number} edge0
 * @param {number} edge1
 * @param {number} x
 */
function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * The WebGL2 glyph field. Loaded lazily with FieldScene. Waits for JetBrains Mono so no character
 * is drawn in a fallback face, and calls `onFailure` when the font or WebGL setup fails, so
 * FieldScene can swap to the CSS field. A lost GPU context stops drawing and calls `onRestart` once
 * the browser restores it (or after a visible wait), so FieldScene can remount the field on a fresh
 * canvas.
 *
 * @param {{ capabilities: import('./types.js').Capabilities, includeDrafts: boolean, onFailure: () => void, onRestart: () => void }} props
 */
export default function FieldStage({ capabilities, includeDrafts, onFailure, onRestart }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  const { ambientCount, transformBudget } = capabilities;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    /** @type {() => void} */
    let teardown = () => {};

    const start = async () => {
      const fontReady = await loadAtlasFont(ATLAS_FONT_FAMILY);
      if (cancelled) return;
      if (!fontReady) {
        onFailure();
        return;
      }

      /** @type {import('./glyphAtlas.js').Atlas} */
      let atlas;
      /** @type {import('./glyphRenderer.js').GlyphRenderer} */
      let renderer;
      try {
        // Printable ASCII too, so any letter a visitor types into their idea can fly.
        atlas = createGlyphAtlas(collectGlyphs([...Object.values(excerpts).map((e) => e.code), PRINTABLE_ASCII]), {
          cell: ATLAS_CELL,
          font: ATLAS_FONT,
        });
        renderer = createGlyphRenderer(canvas, { atlas });
      } catch {
        onFailure();
        return;
      }

      const ambient = getExcerpt('ambient', { includeDrafts });
      const ambientGlyphs = ambient
        ? [...ambient.code].filter((c) => c.trim() !== '').map((c) => atlas.indexOf(c)).filter((i) => i >= 0)
        : null;
      renderer.setAmbient(ambientGlyphs, ambientCount);

      const governor = createGovernor({ base: ambientCount });
      let frame = 0;
      let lastTime = 0;
      /** @type {string | null} */
      let transformKey = null;

      const resize = () => {
        renderer.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, MAX_DPR));
      };
      const sync = () => {
        const state = fieldBus.get();
        renderer.setAmbientState(state.progress, state.intensity);
        const spec = state.transform;
        const key = spec ? spec.key : null;
        if (key !== transformKey) {
          transformKey = key;
          if (!spec) {
            renderer.setTransformation(null, { from: 0, to: 0 });
          } else {
            // Text lands in its real face, and images land on their real pixels, so wait for them.
            loadTarget(spec)
              .then((image) => {
                if (cancelled || transformKey !== spec.key) return;
                const { transformation, sizes } = resolveTransform(spec, { atlas, budget: transformBudget, image });
                renderer.setTransformation(transformation, sizes);
              })
              .catch(() => {
                // The target could not load; the scene keeps showing its DOM state.
                if (transformKey === spec.key) renderer.setTransformation(null, { from: 0, to: 0 });
              });
          }
        }
        const fade = state.transformProgress <= 0 ? 0 : 1 - smoothstep(FADE_FROM, 1, state.transformProgress);
        renderer.setTransformState(state.transformProgress, fade);
      };
      /** @param {number} time */
      const loop = (time) => {
        if (lastTime) renderer.setAmbientCount(governor.sample(time - lastTime));
        lastTime = time;
        renderer.render(time);
        frame = requestAnimationFrame(loop);
      };

      const stopWatching = watchContext(canvas, {
        onLost: () => {
          cancelAnimationFrame(frame);
          delete canvas.dataset.ready;
        },
        onRestart,
      });
      window.addEventListener('resize', resize);
      const unsubscribe = fieldBus.subscribe(sync);
      resize();
      sync();
      frame = requestAnimationFrame(loop);
      canvas.dataset.ready = 'true';
      fieldBus.set({ mode: 'webgl' });

      teardown = () => {
        cancelAnimationFrame(frame);
        unsubscribe();
        window.removeEventListener('resize', resize);
        stopWatching();
        delete canvas.dataset.ready;
        renderer.destroy();
      };
    };

    start();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [ambientCount, transformBudget, includeDrafts, onFailure, onRestart]);

  return (
    <canvas
      ref={canvasRef}
      data-field="webgl"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
