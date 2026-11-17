// @ts-check
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * The journey rail (Code World P3, on the home page since W4): where the visitor is, from the empty
 * file to shipped. Each stop sits at the share of the journey it starts at; the current one is named
 * (`aria-current="step"`), the others are there for screen readers. The marker follows `getProgress`
 * every frame without re-rendering; only a change of stop re-renders. The current stop's name reads
 * down the line beside it, as the ends' do (Chris, 2026-11-17: across, a long name stuck out over the
 * page): centred on its stop where it fits, moved along to stay within the line where it does not, and
 * wrapped into a second column only when it is longer than the whole line.
 * @param {{ stops: ReadonlyArray<{ name: string, from: number }>, getProgress: () => number }} props
 */
export default function JourneyRail({ stops, getProgress }) {
  const markerRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const lineRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const labelRef = useRef(/** @type {HTMLLIElement | null} */ (null));
  const [current, setCurrent] = useState(stops[0]?.name ?? '');

  // The current stop's name, centred on its stop and kept within the line; again whenever the line
  // changes length.
  useLayoutEffect(() => {
    const place = () => {
      const label = labelRef.current;
      const line = lineRef.current;
      const stop = stops.find((s) => s.name === current);
      if (!label || !line || !stop) return;
      const length = line.clientHeight;
      const height = label.offsetHeight;
      const top = Math.min(Math.max(stop.from * length - height / 2, 0), Math.max(0, length - height));
      label.style.top = `${top.toFixed(1)}px`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [stops, current]);

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
      <div ref={lineRef} className="relative my-3 w-px flex-1 bg-white/15">
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
                ref={active ? labelRef : undefined}
                aria-current={active ? 'step' : undefined}
                style={active ? undefined : { top: `${stop.from * 100}%` }}
                className={active ? 'absolute right-3 top-0 max-h-full [writing-mode:vertical-rl]' : 'absolute right-3 whitespace-nowrap'}
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
