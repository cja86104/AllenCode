// @ts-check
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ScrollEngine from '../scroll/ScrollEngine.jsx';
import { useDoor } from '../door/DoorProvider.jsx';
import { fieldBus } from '../field/fieldBus.js';
import { detectCapabilities } from '../field/capabilities.js';
import { readCapabilityEnv } from '../field/environment.js';
import WorldCanvas, { WORLD_SOURCES_APPROVED } from './WorldCanvas.jsx';
import { routeFor } from './route.js';
import { buildTrack, measureSections } from './worldTrack.js';
import { journeyLength, railStops } from './rail.js';
import { markWorldFailed, useWorldPage } from './worldSwitch.js';
import { useIsomorphicLayoutEffect } from '../ssr/useHydrated.js';
import { stretchFor } from './stretches.js';
import { createSurroundings } from './surroundings.js';

/**
 * The journey rail, in a chunk of its own (2026-11-26, Phase 2): it only ever shows on the home page,
 * once the page is measured, and with its jumps (the marks and the Chapters list) it is most of what
 * Phase 2 added; the inner pages, which mount this layer too, no longer download it.
 */
const JourneyRail = lazy(() => import('./JourneyRail.jsx'));

/** The field's device tiers, as the world's glyph budgets name them. */
const TIERS = /** @type {const} */ ({ low: 'low', medium: 'mid', high: 'high' });

/**
 * The Code World in the site's shell, in place of the code field while the home page is the journey
 * (Code World W1.3). It runs the site's scroll engine, the world along the page's track (the gate,
 * the opening, the road between today's chapters), and, with `?meter=1`, the frame meter. The world
 * draws the chapters' flights as the field would, so they play as they do today (W2 revised, R4).
 * Mounted for the home page and for every inner page with a stretch (W5a), and kept from page to
 * page: on an inner page the canvas draws that page's stretch, and the home's track and rail wait.
 */
export default function WorldLayer() {
  const { door } = useDoor();
  const page = useWorldPage();
  const { pathname } = useLocation();
  const isHome = page === 'home';
  // The inner pages' world, in a chunk of its own (2026-11-17): the home page does not wait for it,
  // and it is fetched as soon as the world is mounted, so a drive to an inner page finds it there.
  const stretchModule = useRef(/** @type {typeof import('./stretchWorld.js') | null} */ (null));
  const [stretchReady, setStretchReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import('./stretchWorld.js')
      .then((module) => {
        if (cancelled) return;
        stretchModule.current = module;
        setStretchReady(true);
      })
      .catch(() => markWorldFailed());
    return () => {
      cancelled = true;
    };
  }, []);
  // What the canvas draws, read by its frame loop: the home's journey, this page's stretch (once its
  // world has loaded; nothing is drawn until then), or nothing.
  /** @type {'home' | import('./stretches.js').Stretch | null} */
  const current = isHome ? 'home' : page === 'stretch' && stretchReady ? stretchFor(pathname) : null;
  const pageRef = useRef(current);
  useIsomorphicLayoutEffect(() => {
    pageRef.current = current;
  }, [current]);
  // The route for the door taken (W2.4): the business road with its stops; built once per door.
  const route = useMemo(() => routeFor(door), [door]);
  // The camera's track, measured from the page (R4): on mount, on resize, whenever the page's size
  // changes (chapters loading, a door taken), and for each new route.
  const trackRef = useRef(/** @type {import('./homeWorld.js').TrackState | null} */ (null));
  // The journey rail (W4): its stops from the measured page, the visitor's place along it.
  const [rail, setRail] = useState(/** @type {import('./rail.js').RailStop[]} */ ([]));
  const lengthRef = useRef(1);
  const getRailProgress = useCallback(() => window.scrollY / lengthRef.current, []);
  useEffect(() => {
    // On an inner page the home's track waits; it is measured again on the way back.
    if (!isHome) return undefined;
    let version = trackRef.current?.version ?? 0;
    let queued = 0;
    const measure = () => {
      queued = 0;
      const sections = measureSections(document);
      version += 1;
      trackRef.current = { track: buildTrack(route, sections, { width: window.innerWidth, height: window.innerHeight }), sections, version };
      lengthRef.current = journeyLength(sections);
      setRail(railStops(route, sections));
    };
    const soon = () => {
      if (!queued) queued = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(soon);
    observer.observe(document.documentElement);
    window.addEventListener('resize', soon);
    return () => {
      cancelAnimationFrame(queued);
      observer.disconnect();
      window.removeEventListener('resize', soon);
    };
  }, [route, isHome]);
  const home = useMemo(
    () => ({
      route,
      getTrack: () => trackRef.current,
      getPage: () => pageRef.current,
      /** Called only once a stretch is the page, which waits for its world to load. @param {Parameters<typeof import('./stretchWorld.js').createStretchWorld>[0]} deps */
      createStretch: (deps) => {
        const module = stretchModule.current;
        if (!module) throw new Error('The inner pages’ world is not loaded yet.');
        return module.createStretchWorld(deps);
      },
      createSurroundings,
    }),
    [route],
  );
  const [tier] = useState(() => TIERS[detectCapabilities(readCapabilityEnv()).tier]);
  const [searchParams] = useSearchParams();
  const showMeter = searchParams.get('meter') === '1';
  const [report, setReport] = useState(/** @type {import('./WorldCanvas.jsx').MeterReport | null} */ (null));

  useEffect(() => {
    if (!WORLD_SOURCES_APPROVED) markWorldFailed();
    // The world draws the chapters' flights, so they play as they do with the field (R4).
    fieldBus.set({ mode: 'webgl' });
    return () => fieldBus.set({ mode: 'pending' });
  }, []);

  if (!WORLD_SOURCES_APPROVED) return null;
  return (
    <>
      <ScrollEngine enabled />
      <WorldCanvas tier={tier} home={home} onMeter={showMeter ? setReport : undefined} onFail={markWorldFailed} />
      {isHome && rail.length > 0 && (
        <Suspense fallback={null}>
          <JourneyRail stops={rail} getProgress={getRailProgress} />
        </Suspense>
      )}
      {showMeter && (
        <p
          data-frame-meter
          data-frames={report?.frames ?? 0}
          className="mono fixed bottom-6 left-6 z-50 rounded bg-black/70 px-3 py-2 text-xs text-white"
        >
          {tier} · frames {report?.frames ?? 0} · median {(report?.medianMs ?? 0).toFixed(1)} ms · p95 {(report?.p95Ms ?? 0).toFixed(1)} ms
        </p>
      )}
    </>
  );
}
