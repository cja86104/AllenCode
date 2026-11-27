// @ts-check
import { useEffect, useState } from 'react';
import { createFrameMeter } from '../world/frameMeter.js';

/** How often the readout copies the meter's report into state (not once per frame). */
const REFRESH_MS = 500;

const EMPTY = { frames: 0, medianMs: 0, p95Ms: 0 };

/**
 * The frame-time readout for the site with the world off (`?meter=1`): the same numbers and look as
 * the world's own readout, so the two compare. It times animation frames, and only the readout
 * re-renders, twice a second.
 * @returns {import('react').JSX.Element}
 */
export default function PlainFrameMeter() {
  const [report, setReport] = useState(EMPTY);

  useEffect(() => {
    const meter = createFrameMeter();
    let id = requestAnimationFrame(function loop(now) {
      meter.tick(now);
      id = requestAnimationFrame(loop);
    });
    const timer = window.setInterval(() => setReport(meter.report()), REFRESH_MS);
    return () => {
      cancelAnimationFrame(id);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <p
      data-frame-meter
      data-frames={report.frames}
      className="mono fixed bottom-6 left-6 z-50 rounded bg-black/70 px-3 py-2 text-xs text-white"
    >
      plain · frames {report.frames} · median {report.medianMs.toFixed(1)} ms · p95 {report.p95Ms.toFixed(1)} ms
    </p>
  );
}
