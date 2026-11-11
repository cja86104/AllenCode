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
import { cameraAt, frameCamera } from '../world/camera.js';
import { STOPS, stopAt } from '../world/stops.js';
import { landmarkRect, resolveAt } from '../world/landmark.js';
import MediaLoop from '../components/MediaLoop.jsx';
import { products } from '../data/products.js';
import Lenis from 'lenis';
import { createWorldRenderer } from '../world/worldRenderer.js';
import { createFrameMeter } from '../world/frameMeter.js';

/** The landmark's real screen: UnderFire AI's loop and poster, as the product chapters show them. */
const UNDERFIRE = products.find((product) => product.slug === 'underfire-ai');
const LANDMARK_LOOP = UNDERFIRE?.previewVideo && UNDERFIRE.poster
  ? { src: UNDERFIRE.previewVideo, poster: UNDERFIRE.poster, alt: `${UNDERFIRE.name}, scrolling through its home page` }
  : null;

/** The world is built only from approved code (spec section 5). */
const SOURCES_APPROVED = Boolean(gate.approved && ambient.approved && underfire.approved);
const SIGN_LABELS = 'business/family/';
/** The journey's length in screens of scroll. */
const JOURNEY_SCREENS = 7.2;
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
 * The Code world prototype: an unlinked, noindex lab page outside the site's shell. The camera
 * follows the page's smooth scroll (Lenis, stepped by the world's frame loop) through a world built
 * from approved code, framed for the screen's shape; the current stop is named, and the rail shows
 * where the visitor is between the empty file and shipped (Task P3). `?meter=1` shows the
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
  const markerRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const [stopName, setStopName] = useState(STOPS[0].name);
  const screenRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (mode !== 'world' || !canvas) return undefined;
    let cancelled = false;
    let frame = 0;
    let interval = 0;
    /** @type {ReturnType<typeof createWorldRenderer> | null} */
    let renderer = null;
    /** @type {{ start: number, count: number } | null} */
    let landmarkRange = null;
    const meter = createFrameMeter();

    const resize = () => renderer?.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2));
    const progress = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      return span > 0 ? window.scrollY / span : 0;
    };
    // Smooth scroll for the lab: Lenis, stepped by the world's own frame loop (one loop, no GSAP:
    // the lab has no scroll-triggered animations). Marks <html data-scroll-engine> like the site's
    // ScrollEngine, so the two read the same.
    const root = document.documentElement;
    const lenis = new Lenis();
    root.dataset.scrollEngine = 'on';
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
        const world = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: underfire.code }, 1);
        const ranges = renderer.setShapes(world.map((part) => part.shape));
        landmarkRange = ranges[world.findIndex((part) => part.name === 'landmark')] ?? null;
      } catch {
        setMode('plain');
        return;
      }
      resize();
      const loop = (/** @type {number} */ now) => {
        if (cancelled || !renderer) return;
        lenis.raf(now);
        const p = progress();
        const camera = frameCamera(cameraAt(p), window.innerWidth / window.innerHeight);
        // The sculpture hands over to the real screen: its glyphs fade as the screen fades in over it.
        const resolved = resolveAt(p);
        renderer.render(camera, now, landmarkRange ? { ...landmarkRange, amount: 1 - resolved } : undefined);
        canvas.dataset.landmarkFade = (1 - resolved).toFixed(2);
        const screen = screenRef.current;
        if (screen) {
          const rect = landmarkRect(camera, { width: window.innerWidth, height: window.innerHeight });
          screen.style.left = `${rect.left}px`;
          screen.style.top = `${rect.top}px`;
          screen.style.width = `${rect.width}px`;
          screen.style.height = `${rect.height}px`;
          screen.style.opacity = rect.visible ? String(resolved) : '0';
        }
        setArrived(resolved >= 1);
        // Only a change of stop re-renders React; the rail's marker moves without one.
        setStopName(stopAt(p).name);
        if (markerRef.current) markerRef.current.style.top = `${(p * 100).toFixed(2)}%`;
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
      lenis.destroy();
      delete root.dataset.scrollEngine;
      delete canvas.dataset.ready;
    };
  }, [mode, tier, showMeter]);

  if (mode === 'plain') return <PlainLab />;

  return (
    // 7.2 screens of scroll (Chris, 2026-11-10: eight scrolls to the doors was long; 10 percent shorter).
    <div className="relative bg-night text-white" style={{ height: `${JOURNEY_SCREENS * 100}vh` }}>
      {mode === 'world' && <canvas ref={canvasRef} data-world aria-hidden="true" className="fixed inset-0 h-screen w-screen" />}
      <header className="fixed left-6 top-6 z-10 space-y-2">
        <p className="mono text-xs tracking-widest text-ember">~/allencode/lab/world</p>
        <h1 className="font-serif-display text-2xl italic">Code world, a prototype</h1>
        <HomeLink />
      </header>
      {/* The landmark's real screen, laid exactly over the sculpture; its loop plays once arrived. */}
      {LANDMARK_LOOP && (
        <div
          ref={screenRef}
          data-landmark-screen
          style={{ position: 'fixed', left: 0, top: 0, width: 0, height: 0, opacity: 0 }}
          className="pointer-events-none z-[6] overflow-hidden rounded-md shadow-2xl ring-1 ring-ember/40"
        >
          <MediaLoop {...LANDMARK_LOOP} active={arrived} className="h-full w-full" />
        </div>
      )}

      {/* A soft fade under the stop's words, so they read over the busiest part of the road. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] h-[45vh] bg-gradient-to-t from-night via-night/80 to-transparent" />

      {/* The current stop's words; the others are faded out and hidden from assistive technology. */}
      <div className="pointer-events-none fixed bottom-24 left-6 right-16 z-10 max-w-md sm:left-10">
        {STOPS.map((stop) => {
          const active = stop.name === stopName;
          return (
            <section
              key={stop.name}
              data-active-stop={active ? stop.name : undefined}
              aria-hidden={active ? undefined : true}
              style={{ opacity: active ? 1 : 0, transition: 'opacity 600ms ease' }}
              className="absolute bottom-0 left-0 right-0"
            >
              <h2 className="font-serif-display text-4xl italic leading-tight sm:text-5xl">{stop.name}</h2>
              <p className="mt-3 text-base text-white/75 sm:text-lg">{stop.text}</p>
            </section>
          );
        })}
      </div>

      {/* The rail: where the visitor is, from the empty file to shipped. */}
      <nav data-rail aria-label="Journey" className="fixed bottom-24 right-4 top-28 z-10 flex flex-col items-center sm:right-8">
        <span className="mono text-[10px] uppercase tracking-[0.25em] text-white/60 [writing-mode:vertical-rl]">empty file</span>
        <div className="relative my-3 w-px flex-1 bg-white/15">
          <span ref={markerRef} aria-hidden="true" className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember" />
          <ol className="absolute inset-0">
            {STOPS.map((stop) => {
              const active = stop.name === stopName;
              return (
                <li
                  key={stop.name}
                  aria-current={active ? 'step' : undefined}
                  style={{ top: `${stop.from * 100}%` }}
                  className="absolute right-3 -translate-y-1/2 whitespace-nowrap text-right"
                >
                  <span className={active ? 'mono text-[10px] uppercase tracking-[0.2em] text-ember' : 'sr-only'}>{stop.name}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <span className="mono text-[10px] uppercase tracking-[0.25em] text-white/60 [writing-mode:vertical-rl]">shipped</span>
      </nav>

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
