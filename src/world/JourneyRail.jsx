// @ts-check
import { useEffect, useRef, useState } from 'react';

/**
 * The journey rail (Code World P3, on the home page since W4): where the visitor is, from the empty
 * file to shipped. Each stop sits at the share of the journey it starts at; the current one is named
 * (`aria-current="step"`), the others are there for screen readers. The marker follows `getProgress`
 * every frame without re-rendering; only a change of stop re-renders.
 * @param {{ stops: ReadonlyArray<{ name: string, from: number }>, getProgress: () => number }} props
 */
export default function JourneyRail({ stops, getProgress }) {
  const markerRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const [current, setCurrent] = useState(stops[0]?.name ?? '');

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const raw = getProgress();
      const progress = Math.min(1, Math.max(0, Number.isFinite(raw) ? raw : 0));
      if (markerRef.current) markerRef.current.style.top = `${(progress * 100).toFixed(2)}%`;
      const here = stops.reduce((name, stop) => (stop.from <= progress + 1e-9 ? stop.name : name), stops[0]?.name ?? '');
      setCurrent(here);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stops, getProgress]);

  return (
    <nav data-rail aria-label="Journey" className="fixed bottom-24 right-4 top-28 z-10 flex flex-col items-center sm:right-8">
      <span className="mono text-[10px] uppercase tracking-[0.25em] text-white/60 [writing-mode:vertical-rl]">empty file</span>
      <div className="relative my-3 w-px flex-1 bg-white/15">
        <span
          ref={markerRef}
          data-rail-marker
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember"
        />
        <ol className="absolute inset-0">
          {stops.map((stop) => {
            const active = stop.name === current;
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
  );
}
