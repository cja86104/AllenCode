// @ts-check
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDoor } from '../door/DoorProvider.jsx';
import { DOORS } from '../door/Fork.jsx';
import { branchForGesture } from '../world/journey.js';
import { routeFor } from '../world/route.js';
import { glideTo } from '../scroll/glide.js';
import { journeyProgress } from '../world/journeyProgress.js';
import { GATE_LINE } from './Gate.jsx';
import { HEADLINE_LINES } from './headline.js';
import { worldFrame } from '../world/worldFrame.js';
import RoadStop from './RoadStop.jsx';
import WorldScreen from './WorldScreen.jsx';

/** Each stop's line under its name; the first stop carries the approved line and headline instead. */
const STOP_LINES = Object.freeze({
  'into-the-code': 'Step through the file. Its characters become the world.',
  'the-road': 'A road made of this site’s code, running into the dark.',
  'the-fork': 'Two roads from here: business/ for a product or a company, family/ for a site of your own.',
});

/** Room kept between the real screen and its words, and below the words, in CSS pixels. */
const WORDS_GAP = 12;
const WORDS_BOTTOM = 24;
/** The words never shrink below this, however tall. */
const WORDS_MIN_SCALE = 0.6;

/**
 * On a screen taller than wide the words stand below the real screen; when a stop's words (all of
 * them, as the spec names them) are taller than the room left, they scale down to fit, from their
 * bottom left, as How I work's pinned chapter does. Elsewhere they keep their size.
 * @param {Map<string, HTMLDivElement>} words
 * @param {import('../world/worldFrame.js').WorldFrame} frame
 */
function fitWords(words, frame) {
  const handover = frame.handover;
  const narrow = window.innerWidth < window.innerHeight;
  for (const [id, el] of words) {
    let scale = 1;
    if (narrow && handover && handover.stopId === id && handover.rect.visible) {
      const room = window.innerHeight - WORDS_BOTTOM - (handover.rect.top + handover.rect.height + WORDS_GAP);
      const height = el.offsetHeight;
      if (height > room) scale = Math.max(WORDS_MIN_SCALE, room / height);
    }
    const transform = scale < 1 ? `scale(${scale.toFixed(4)})` : '';
    if (el.style.transform !== transform) {
      el.style.transform = transform;
      el.style.transformOrigin = 'bottom left';
    }
  }
}

/**
 * The top of the home page as the Code World journey (Code World W1.3): one tall section the world
 * is drawn behind, and over it, held on screen, the words of the stop the visitor is at. The first
 * stop carries the approved line and headline (the page's h1). Every stop's words stay in the page
 * for readers and assistive technology; only the current one is shown.
 */
export default function WorldJourney() {
  const { door, setDoor } = useDoor();
  // The same route the canvas draws (W2.4), so the page's length and the camera agree.
  const route = useMemo(() => routeFor(door), [door]);
  const journey = route.journey;
  const roadStops = route.road?.stops ?? [];
  // How many of how I work's commits the camera has passed, as the canvas reports it (W2.5).
  const [commits, setCommits] = useState(0);
  /** Each road stop's words, by stop id, to fit them under the real screen on a phone. */
  const wordsRef = useRef(/** @type {Map<string, HTMLDivElement>} */ (new Map()));
  useEffect(
    () =>
      worldFrame.subscribe((frame) => {
        setCommits(frame.commits);
        fitWords(wordsRef.current, frame);
      }),
    [],
  );
  const [stopId, setStopId] = useState(journey.stops[0].id);
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  // Set when the visitor takes a road here, so the page glides down it once the journey has grown.
  const glidePending = useRef(false);
  const atFork = stopId === 'the-fork';

  /** Glides the page to just inside the road taken: its own stop, where the camera turns onto it. */
  const glideDownRoad = useCallback(() => {
    const section = sectionRef.current;
    const road = journey.stops.find((stop) => stop.id === 'business-road' || stop.id === 'family-road');
    if (!section || !road) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    glideTo(top + (section.offsetHeight - window.innerHeight) * (road.from + 0.02));
  }, [journey]);

  /**
   * Takes a road at the split (Code World W1.4): the door is stored as the fork stores it. Choosing
   * the road already taken runs down it again; a new road first grows the journey, then glides.
   */
  const take = useCallback(
    (/** @type {'a' | 'b'} */ road) => {
      if (road === door) {
        glideDownRoad();
        return;
      }
      glidePending.current = true;
      setDoor(road);
    },
    [door, glideDownRoad, setDoor],
  );

  // Once the journey has grown down the road just taken, glide to where that road begins.
  useEffect(() => {
    if (!glidePending.current || !door) return;
    glidePending.current = false;
    glideDownRoad();
  }, [glideDownRoad, door]);

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
    // The browser cancels a touch it takes over (an up-and-down scroll): that touch takes nothing.
    const onCancel = () => {
      start = null;
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
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.clearTimeout(wheelTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
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
  const landmarkOf = (/** @type {string} */ id) => journey.landmarks.find((landmark) => landmark.stopId === id);
  const onRoad = (/** @type {string} */ id) => roadStops.some((stop) => stop.id === id);
  const openingStops = journey.stops.filter((stop) => !onRoad(stop.id));

  /** The marks every stop carries: its place on the journey (0..1), for its words and for tests. */
  const marks = (/** @type {import('../world/journey.js').JourneyStop} */ stop) => ({
    'data-active-stop': stop.id === stopId ? stop.name : undefined,
    'data-stop-id': stop.id,
    'data-from': stop.from,
    'data-to': stop.to,
    'data-arrive': landmarkOf(stop.id)?.arriveAt,
    'data-hold': landmarkOf(stop.id)?.holdAt,
  });

  /**
   * Keyboard visitors reach a stop's links while the stop is off screen (every stop's words stay in
   * the page): focus there glides the page to that stop, so focus is never on something unseen.
   * @param {import('../world/journey.js').JourneyStop} stop
   */
  const goToStop = (stop) => {
    const section = sectionRef.current;
    if (!section || stop.id === stopId) return;
    const landmark = landmarkOf(stop.id);
    const at = landmark ? (landmark.arriveAt + landmark.holdAt) / 2 : (stop.from + stop.to) / 2;
    const top = section.getBoundingClientRect().top + window.scrollY;
    glideTo(top + (section.offsetHeight - window.innerHeight) * at);
  };

  return (
    <section
      ref={sectionRef}
      data-world-journey
      data-chapter="world-journey"
      className="relative"
      // At the split a sideways swipe is the visitor choosing a road, so the browser keeps only
      // up-and-down panning. Set here, on the element touches land on: the frame above it lets
      // touches through and its own setting would never apply.
      style={{ height: `${(journey.screens + 1) * 100}vh`, touchAction: atFork ? 'pan-y' : undefined }}
    >
      <div className="pin-frame pointer-events-none sticky top-0 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-night via-night/80 to-transparent" />
        <div className="absolute bottom-24 left-6 right-16 max-w-xl sm:left-10">
          {openingStops.map((stop) => {
            const active = stop.id === stopId;
            return (
              <div
                key={stop.id}
                {...marks(stop)}
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
        {/* The road's stops: below the landmark on a phone, left of it on a screen wider than tall,
            where the camera sets the landmark to the right (W2.5). */}
        {roadStops.map((roadStop) => {
          const stop = journey.stops.find((s) => s.id === roadStop.id);
          if (!stop) return null;
          const active = stop.id === stopId;
          return (
            <div
              key={stop.id}
              ref={(el) => {
                if (el) wordsRef.current.set(stop.id, el);
                else wordsRef.current.delete(stop.id);
              }}
              {...marks(stop)}
              onFocusCapture={() => goToStop(stop)}
              style={{ opacity: active ? 1 : 0, transition: 'opacity 600ms ease' }}
              className={`absolute inset-x-6 bottom-6 sm:inset-x-10 wide:bottom-auto wide:right-auto wide:top-1/2 wide:w-[min(35vw,34rem)] wide:-translate-y-1/2 ${active ? 'pointer-events-auto' : ''}`}
            >
              <RoadStop stop={roadStop} commits={commits} />
            </div>
          );
        })}
      </div>
      {route.road && <WorldScreen stops={route.road.stops} />}
    </section>
  );
}
