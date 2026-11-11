// @ts-check
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDoor } from '../door/DoorProvider.jsx';
import { DOORS } from '../door/Fork.jsx';
import { branchForGesture, buildJourney } from '../world/journey.js';
import { glideTo } from '../scroll/glide.js';
import { journeyProgress } from '../world/journeyProgress.js';
import { GATE_LINE } from './Gate.jsx';
import { HEADLINE_LINES } from './headline.js';

/** Each stop's line under its name; the first stop carries the approved line and headline instead. */
const STOP_LINES = Object.freeze({
  'into-the-code': 'Step through the file. Its characters become the world.',
  'the-road': 'A road made of this site’s code, running into the dark.',
  'the-fork': 'Two roads from here: business/ for a product or a company, family/ for a site of your own.',
});

/**
 * The top of the home page as the Code World journey (Code World W1.3): one tall section the world
 * is drawn behind, and over it, held on screen, the words of the stop the visitor is at. The first
 * stop carries the approved line and headline (the page's h1). Every stop's words stay in the page
 * for readers and assistive technology; only the current one is shown.
 */
export default function WorldJourney() {
  const { door, setDoor } = useDoor();
  const journey = useMemo(() => buildJourney(door), [door]);
  const [stopId, setStopId] = useState(journey.stops[0].id);
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  // Set when the visitor takes a road here, so the page glides down it once the journey has grown.
  const glidePending = useRef(false);
  const atFork = stopId === 'the-fork';

  /** Takes a road at the split (Code World W1.4): the door is stored as the fork stores it. */
  const take = useCallback(
    (/** @type {'a' | 'b'} */ road) => {
      glidePending.current = true;
      setDoor(road);
    },
    [setDoor],
  );

  // Once the journey has grown down the road just taken, glide to where that road begins.
  useEffect(() => {
    const section = sectionRef.current;
    if (!glidePending.current || !door || !section) return;
    glidePending.current = false;
    const road = journey.stops[journey.stops.length - 1];
    const top = section.getBoundingClientRect().top + window.scrollY;
    glideTo(top + (section.offsetHeight - window.innerHeight) * (road.from + 0.02));
  }, [journey, door]);

  // At the split: ← and →, a sideways drag or swipe toward the road wanted (finger or mouse
  // moving left takes business/), sideways wheel and trackpad scrolling (scrolling right takes
  // family/), and on touch screens a tap on either half of the screen. Up-and-down movement and
  // short drifts take nothing; taps on links and buttons are theirs.
  useEffect(() => {
    if (!atFork) return undefined;
    /** @type {{ x: number, y: number } | null} */
    let start = null;
    let wheel = { dx: 0, dy: 0 };
    let wheelTimer = 0;
    const onKey = (/** @type {KeyboardEvent} */ event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') take('a');
      else if (event.key === 'ArrowRight') take('b');
    };
    const onDown = (/** @type {PointerEvent} */ event) => {
      if (event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY };
    };
    const onUp = (/** @type {PointerEvent} */ event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      const road = branchForGesture({ dx, dy });
      if (road) {
        take(road);
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const isTap = Math.hypot(dx, dy) < 8;
      if (event.pointerType === 'touch' && isTap && !target?.closest('a, button, input, select, textarea, label')) {
        take(event.clientX < window.innerWidth / 2 ? 'a' : 'b');
      }
    };
    const onWheel = (/** @type {WheelEvent} */ event) => {
      wheel = { dx: wheel.dx + event.deltaX, dy: wheel.dy + event.deltaY };
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        wheel = { dx: 0, dy: 0 };
      }, 250);
      const road = branchForGesture(wheel);
      if (road) {
        wheel = { dx: 0, dy: 0 };
        take(road);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.clearTimeout(wheelTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, [atFork, take]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = journeyProgress();
      const stop = journey.stops.find((s) => progress < s.to) ?? journey.stops[journey.stops.length - 1];
      setStopId(stop.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [journey]);

  const branch = door ? DOORS.find((option) => option.door === door) : null;

  return (
    <section
      ref={sectionRef}
      data-world-journey
      data-chapter="world-journey"
      className="relative"
      style={{ height: `${(journey.screens + 1) * 100}vh` }}
    >
      <div className="pin-frame pointer-events-none sticky top-0 overflow-hidden" style={atFork ? { touchAction: 'pan-y' } : undefined}>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-night via-night/80 to-transparent" />
        <div className="absolute bottom-24 left-6 right-16 max-w-xl sm:left-10">
          {journey.stops.map((stop) => {
            const active = stop.id === stopId;
            return (
              <div
                key={stop.id}
                data-active-stop={active ? stop.name : undefined}
                style={{ opacity: active ? 1 : 0, transition: 'opacity 600ms ease' }}
                className="absolute bottom-0 left-0 right-0"
              >
                {stop.id === 'empty-file' ? (
                  <>
                    <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{GATE_LINE}</p>
                    <h1 className="mt-4 font-serif-display text-4xl italic leading-tight text-white sm:text-6xl">
                      {HEADLINE_LINES.map((line, i) => (
                        <span key={line} className="block">
                          {i > 0 ? ' ' : ''}
                          {line}
                        </span>
                      ))}
                    </h1>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{stop.name}</h2>
                    <p className="mt-3 text-base text-white/75 sm:text-lg">
                      {branch && (stop.id === 'business-road' || stop.id === 'family-road')
                        ? `${branch.label}: ${branch.promise}.`
                        : STOP_LINES[/** @type {keyof typeof STOP_LINES} */ (stop.id)]}
                    </p>
                    {stop.id === 'the-fork' && (
                      // The two signposts as real buttons: keyboard and screen-reader visitors take a
                      // road exactly as before; the road taken is marked.
                      <div className={`mt-6 flex flex-wrap gap-3 ${active ? 'pointer-events-auto' : ''}`}>
                        {DOORS.map((option) => (
                          <button
                            key={option.door}
                            type="button"
                            tabIndex={active ? 0 : -1}
                            aria-pressed={door === option.door}
                            onClick={() => take(option.door)}
                            className="mono rounded-full border border-white/25 bg-night/70 px-5 py-3 text-left text-xs uppercase tracking-widest text-white hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember aria-pressed:border-ember aria-pressed:text-ember"
                          >
                            {option.file}
                            <span className="sr-only"> {option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
