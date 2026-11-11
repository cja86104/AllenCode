// @ts-check
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScrollEngine from '../scroll/ScrollEngine.jsx';
import { useDoor } from '../door/DoorProvider.jsx';
import { fieldBus } from '../field/fieldBus.js';
import { detectCapabilities } from '../field/capabilities.js';
import { readCapabilityEnv } from '../field/environment.js';
import WorldCanvas, { WORLD_SOURCES_APPROVED } from './WorldCanvas.jsx';
import { buildJourney } from './journey.js';
import { journeyProgress } from './journeyProgress.js';
import { markWorldFailed } from './worldSwitch.js';

/** The field's device tiers, as the world's glyph budgets name them. */
const TIERS = /** @type {const} */ ({ low: 'low', medium: 'mid', high: 'high' });

/**
 * The Code World in the site's shell, in place of the code field while the home page is the journey
 * (Code World W1.3). It runs the site's scroll engine (the home page's chapters glide with it), the
 * world along the visitor's journey, and, with `?meter=1`, the frame meter. The chapters below the
 * journey show their code beside their result (the field's static mode), since the world, not the
 * field, draws here.
 */
export default function WorldLayer() {
  const { door } = useDoor();
  const journey = useMemo(() => buildJourney(door), [door]);
  const [tier] = useState(() => TIERS[detectCapabilities(readCapabilityEnv()).tier]);
  const [searchParams] = useSearchParams();
  const showMeter = searchParams.get('meter') === '1';
  const [report, setReport] = useState(/** @type {import('./WorldCanvas.jsx').MeterReport | null} */ (null));

  useEffect(() => {
    if (!WORLD_SOURCES_APPROVED) markWorldFailed();
    fieldBus.set({ mode: 'static' });
    return () => fieldBus.set({ mode: 'pending' });
  }, []);

  if (!WORLD_SOURCES_APPROVED) return null;
  return (
    <>
      <ScrollEngine enabled />
      <WorldCanvas getProgress={journeyProgress} tier={tier} keys={journey.keys} onMeter={showMeter ? setReport : undefined} onFail={markWorldFailed} />
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
