// @ts-check
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScrollEngine from '../scroll/ScrollEngine.jsx';
import { useDoor } from '../door/DoorProvider.jsx';
import { fieldBus } from '../field/fieldBus.js';
import { detectCapabilities } from '../field/capabilities.js';
import { readCapabilityEnv } from '../field/environment.js';
import WorldCanvas, { WORLD_SOURCES_APPROVED } from './WorldCanvas.jsx';
import { routeFor } from './route.js';
import { buildTrack, measureSections } from './worldTrack.js';
import { markWorldFailed } from './worldSwitch.js';

/** The field's device tiers, as the world's glyph budgets name them. */
const TIERS = /** @type {const} */ ({ low: 'low', medium: 'mid', high: 'high' });

/**
 * The Code World in the site's shell, in place of the code field while the home page is the journey
 * (Code World W1.3). It runs the site's scroll engine, the world along the page's track (the gate,
 * the opening, the road between today's chapters), and, with `?meter=1`, the frame meter. The world
 * draws the chapters' flights as the field would, so they play as they do today (W2 revised, R4).
 */
export default function WorldLayer() {
  const { door } = useDoor();
  // The route for the door taken (W2.4): the business road with its stops; built once per door.
  const route = useMemo(() => routeFor(door), [door]);
  // The camera's track, measured from the page (R4): on mount, on resize, whenever the page's size
  // changes (chapters loading, a door taken), and for each new route.
  const trackRef = useRef(/** @type {import('./homeWorld.js').TrackState | null} */ (null));
  useEffect(() => {
    let version = trackRef.current?.version ?? 0;
    let queued = 0;
    const measure = () => {
      queued = 0;
      const sections = measureSections(document);
      version += 1;
      trackRef.current = { track: buildTrack(route, sections, { width: window.innerWidth, height: window.innerHeight }), sections, version };
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
  }, [route]);
  const home = useMemo(() => ({ route, getTrack: () => trackRef.current }), [route]);
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
