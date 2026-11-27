// @ts-check
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { requestJump } from './jump.js';
import { spreadMarks } from './railMarks.js';

/** @typedef {import('./rail.js').RailStop} RailStop */

/** The least distance between two marks on the line, in CSS pixels: a pointer target (WCAG 2.2). */
const MARK_GAP = 24;

/**
 * Where focus goes once a jump has arrived (2026-11-26): the stop's own heading (a road stop's chapter,
 * the opening's words for its stops, the gate's headline, the brief's title), made focusable for it.
 * @param {string} id
 */
function focusStop(id) {
  const holder =
    id === 'empty-file'
      ? document.querySelector('[data-world-segment="gate"]')
      : id === 'brief'
        ? document.querySelector('[data-chapter="brief"]')
        : document.querySelector(`[data-world-stop="${CSS.escape(id)}"], [data-stop-id="${CSS.escape(id)}"]`);
  const heading = holder?.querySelector('h1, h2, h3') ?? holder;
  if (!(heading instanceof HTMLElement)) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

/** By default a stop is reached by the world's jump, and focus follows it there. @param {RailStop} stop */
const jumpTo = (stop) => requestJump(stop.y, () => focusStop(stop.id));

/** Whether the visitor points with a mouse or trackpad (marks to aim at on the line), followed live. */
function useFinePointer() {
  const query = '(pointer: fine)';
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(query);
    const update = () => setFine(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return fine;
}

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
 *
 * Jumps (2026-11-26, Phase 2, Chris: "keep the length but add the jumps"): on a fine pointer each stop
 * has a mark on the line to click, eased at least 24 px apart where stops crowd (`spreadMarks`); the
 * marks are a pointer's shortcut, out of the tab order and hidden from screen readers. On every device
 * the Chapters button at the rail's foot opens the stops as a list (the keyboard's, the screen
 * reader's and the phone's way), the current one marked, then Start a project (the brief): closed by a
 * choice, Escape (focus back on Chapters) or a click outside it. A jump plays the world's drive
 * (`jump.js`) and focus lands on the stop's own heading.
 * @param {{ stops: ReadonlyArray<RailStop>, getProgress: () => number, onJump?: (stop: RailStop) => void }} props
 */
export default function JourneyRail({ stops, getProgress, onJump = jumpTo }) {
  const markerRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const lineRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const labelRef = useRef(/** @type {HTMLLIElement | null} */ (null));
  const toggleRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [current, setCurrent] = useState(stops[0]?.name ?? '');
  const [open, setOpen] = useState(false);
  const [lineLength, setLineLength] = useState(0);
  const fine = useFinePointer();
  const listId = useId();

  // The line's length, for the marks: on mount and whenever the window changes size.
  useLayoutEffect(() => {
    const measure = () => setLineLength(lineRef.current?.clientHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // The list closes on Escape, giving focus back to Chapters, and on a press anywhere outside it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (/** @type {KeyboardEvent} */ event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onDown = (/** @type {PointerEvent} */ event) => {
      const target = event.target instanceof Node ? event.target : null;
      if (target && (panelRef.current?.contains(target) || toggleRef.current?.contains(target))) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  /** Closes the list and jumps. @param {RailStop} stop */
  const choose = (stop) => {
    setOpen(false);
    onJump(stop);
  };

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

  const marks = fine && lineLength > 0 ? spreadMarks(stops.map((stop) => stop.from), lineLength, MARK_GAP) : [];
  const brief = stops.find((stop) => stop.id === 'brief');

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
        {marks.length > 0 && (
          // A pointer's shortcut to each stop; the keyboard's and screen reader's is the Chapters list.
          <div data-rail-marks aria-hidden="true" className="absolute inset-0">
            {stops.map((stop, i) => (
              <button
                key={stop.id}
                type="button"
                tabIndex={-1}
                data-rail-mark={stop.id}
                onClick={() => onJump(stop)}
                style={{ top: `${marks[i].toFixed(1)}px` }}
                className="group absolute left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 transition-colors group-hover:bg-ember" />
                <span className="mono pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-night/90 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {stop.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <span className={endClass(BOTTOM_END)}>{BOTTOM_END}</span>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((was) => !was)}
        className="mono mt-3 rounded-full border border-white/25 bg-night/70 px-1.5 py-3 text-[10px] uppercase tracking-[0.25em] text-white/80 [writing-mode:vertical-rl] hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember aria-expanded:border-ember aria-expanded:text-ember"
      >
        Chapters
      </button>
      {open && (
        <div
          ref={panelRef}
          id={listId}
          data-chapters
          className="absolute bottom-0 right-9 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-white/15 bg-night/95 p-2 shadow-2xl backdrop-blur"
        >
          <ol>
            {stops
              .filter((stop) => stop.id !== 'brief')
              .map((stop) => (
                <li key={stop.id}>
                  <button
                    type="button"
                    aria-current={stop.name === current ? 'step' : undefined}
                    onClick={() => choose(stop)}
                    className="mono w-full rounded-lg px-3 py-2 text-left text-[11px] uppercase tracking-[0.2em] text-white/75 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember aria-[current=step]:text-ember"
                  >
                    {stop.name}
                  </button>
                </li>
              ))}
            {brief && (
              <li className="mt-1 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => choose(brief)}
                  className="mono w-full rounded-lg border border-ember px-3 py-2 text-left text-[11px] uppercase tracking-[0.2em] text-ember hover:bg-ember hover:text-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  Start a project
                </button>
              </li>
            )}
          </ol>
        </div>
      )}
    </nav>
  );
}
