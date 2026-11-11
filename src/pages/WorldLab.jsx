// @ts-check
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { detectCapabilities } from '../field/capabilities.js';
import { readCapabilityEnv } from '../field/environment.js';
import { ATLAS_CELL, ATLAS_FONT, ATLAS_FONT_FAMILY, collectGlyphs, createGlyphAtlas, loadAtlasFont } from '../field/glyphAtlas.js';
import gate from '../content/excerpts/gate.js';
import ambient from '../content/excerpts/ambient.js';
import underfire from '../content/excerpts/product-underfire-ai.js';
import { buildWorld } from '../world/shapes.js';
import { cameraAt } from '../world/camera.js';
import { createWorldRenderer } from '../world/worldRenderer.js';
import { createFrameMeter } from '../world/frameMeter.js';

/** The prototype's stops, in order (docs/superpowers/plans/2026-11-10-code-world-prototype.md). */
const STOPS = Object.freeze([
  { name: 'Empty file', text: 'The empty editor; this site’s own entry point types itself in.' },
  { name: 'Into the code', text: 'The camera pushes into the file and its characters stream past.' },
  { name: 'The road', text: 'A road made of the site’s code runs into the dark, with ember sparks.' },
  { name: 'The fork', text: 'The road splits at two signposts: business/ and family/.' },
  { name: 'First landmark', text: 'UnderFire AI, a sculpture of its own code, waiting to become its real screen.' },
]);

/** The world is built only from approved code (spec section 5). */
const SOURCES_APPROVED = Boolean(gate.approved && ambient.approved && underfire.approved);
const SIGN_LABELS = 'business/family/';
/** The field's device tiers, as the world's glyph budgets name them. */
const TIERS = /** @type {const} */ ({ low: 'low', medium: 'mid', high: 'high' });

/** @typedef {'world' | 'plain'} Mode */
/** @typedef {{ frames: number, medianMs: number, p95Ms: number }} MeterReport */

/** A link back to the real site. */
function HomeLink() {
  return (
    <Link to="/" className="mono text-xs uppercase tracking-widest text-white/75 hover:text-ember">
      ← allencodeco.com
    </Link>
  );
}

/** Reduced motion, no WebGL2, or a lost GPU context: the journey in words. */
function PlainLab() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24 text-white">
      <p className="mono text-xs tracking-widest text-ember">~/allencode/lab/world</p>
      <h1 className="mt-4 font-serif-display text-5xl italic">Code world, a prototype</h1>
      <p className="mt-4 text-white/75">This browser shows the journey in words: it prefers reduced motion or has no WebGL2.</p>
      <ol className="mt-10 space-y-6">
        {STOPS.map((stop) => (
          <li key={stop.name}>
            <h2 className="font-serif-display text-2xl italic">{stop.name}</h2>
            <p className="mt-1 text-white/70">{stop.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <HomeLink />
      </div>
    </main>
  );
}

/**
 * The Code world prototype (Task P2): an unlinked, noindex lab page outside the site's shell. The
 * camera follows the page's scroll through a world built from approved code; `?meter=1` shows the
 * frame-time numbers that decide go or no-go (Task P5).
 */
export default function WorldLab() {
  usePageMeta('Code world (lab) — Allen Code Co.', 'A prototype of a scroll journey through a world built from code. Not part of the site.', {
    noindex: true,
  });
  // Read once from this browser. The lab is never server-rendered (it is not in the sitemap, so the
  // build never prerenders it and the shell serves it), so reading the device here is safe.
  const [capabilities] = useState(() => detectCapabilities(readCapabilityEnv()));
  const tier = TIERS[capabilities.tier];
  const [mode, setMode] = useState(
    /** @type {Mode} */ (capabilities.webgl2 && !capabilities.reducedMotion && SOURCES_APPROVED ? 'world' : 'plain'),
  );
  const [report, setReport] = useState(/** @type {MeterReport | null} */ (null));
  const [searchParams] = useSearchParams();
  const showMeter = searchParams.get('meter') === '1';
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (mode !== 'world' || !canvas) return undefined;
    let cancelled = false;
    let frame = 0;
    let interval = 0;
    /** @type {ReturnType<typeof createWorldRenderer> | null} */
    let renderer = null;
    const meter = createFrameMeter();

    const resize = () => renderer?.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2));
    const progress = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      return span > 0 ? window.scrollY / span : 0;
    };
    const lost = (/** @type {Event} */ event) => {
      event.preventDefault();
      setMode('plain');
    };

    const start = async () => {
      // The atlas is drawn at weight 500, so wait for that exact face, as the field's stage does;
      // waiting for the family alone loaded weight 400 and the atlas fell back to a serif.
      await loadAtlasFont(ATLAS_FONT_FAMILY);
      const faces = await document.fonts.load(ATLAS_FONT).catch(() => []);
      if (cancelled) return;
      canvas.dataset.atlasFont = faces.length > 0 ? 'loaded' : 'fallback';
      try {
        const atlas = createGlyphAtlas(collectGlyphs([gate.code, ambient.code, underfire.code, SIGN_LABELS]), { cell: ATLAS_CELL, font: ATLAS_FONT });
        renderer = createWorldRenderer(canvas, atlas);
        renderer.setShapes(buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1).map((part) => part.shape));
      } catch {
        setMode('plain');
        return;
      }
      resize();
      const loop = (/** @type {number} */ now) => {
        if (cancelled || !renderer) return;
        const p = progress();
        renderer.render(cameraAt(p), now);
        meter.tick(now);
        canvas.dataset.progress = p.toFixed(3);
        canvas.dataset.ready = 'true';
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
      if (showMeter) interval = window.setInterval(() => setReport(meter.report()), 500);
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
      delete canvas.dataset.ready;
    };
  }, [mode, tier, showMeter]);

  if (mode === 'plain') return <PlainLab />;

  return (
    <div className="relative bg-night text-white" style={{ height: '800vh' }}>
      {mode === 'world' && <canvas ref={canvasRef} data-world aria-hidden="true" className="fixed inset-0 h-screen w-screen" />}
      <header className="fixed left-6 top-6 z-10 space-y-2">
        <p className="mono text-xs tracking-widest text-ember">~/allencode/lab/world</p>
        <h1 className="font-serif-display text-2xl italic">Code world, a prototype</h1>
        <HomeLink />
      </header>
      {showMeter && (
        <p
          data-frame-meter
          data-frames={report?.frames ?? 0}
          className="mono fixed bottom-6 left-6 z-10 rounded bg-black/70 px-3 py-2 text-xs text-white"
        >
          {tier} · frames {report?.frames ?? 0} · median {(report?.medianMs ?? 0).toFixed(1)} ms · p95 {(report?.p95Ms ?? 0).toFixed(1)} ms
        </p>
      )}
    </div>
  );
}
