// @ts-check
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** The rail's two ends: the journey's first stop and, once it reaches the brief, its last. */
const TOP_END = 'empty file';
const BOTTOM_END = 'shipped';

/**
 * Whether a stop is one the rail's ends already name (2026-11-26: at the empty file the rail read
 * EMPTY FILE twice, the end's label and the current stop's).
 * @param {string} name
 */
const namedByEnd = (name) => {
  const lower = name.toLowerCase();
  return lower === TOP_END || lower === BOTTOM_END;
};

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

  const here = current.toLowerCase();
  /** An end's label, lit while it is the current stop. @param {string} name */
  const endClass = (name) => `mono text-[10px] uppercase tracking-[0.25em] [writing-mode:vertical-rl] ${here === name ? 'text-ember' : 'text-white/60'}`;

  return (
    <nav data-rail aria-label="Journey" className="fixed bottom-24 right-4 top-28 z-10 flex flex-col items-center sm:right-8">
      <span className={endClass(TOP_END)}>{TOP_END}</span>
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
            // The current stop is named down the line, unless an end already names it (it is lit instead).
            const shown = active && !namedByEnd(stop.name);
            return (
              <li
                key={stop.name}
                ref={shown ? labelRef : undefined}
                aria-current={active ? 'step' : undefined}
                style={shown ? undefined : { top: `${stop.from * 100}%` }}
                className={shown ? 'absolute right-3 top-0 max-h-full [writing-mode:vertical-rl]' : 'absolute right-3 whitespace-nowrap'}
              >
                <span className={shown ? 'mono text-[10px] uppercase tracking-[0.2em] text-ember' : 'sr-only'}>{stop.name}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <span className={endClass(BOTTOM_END)}>{BOTTOM_END}</span>
    </nav>
  );
}
