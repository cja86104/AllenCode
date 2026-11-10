// @ts-check
import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useDoor } from './DoorProvider.jsx';
import { fieldBus } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { glideTo } from '../scroll/glide.js';

/** @typedef {import('./doorStorage.js').Door} Door */

/**
 * The two doors as files to open: a folder name, the choice in the visitor's words, a one-line
 * promise, and the first chapter the page glides to once the file is open.
 * @type {ReadonlyArray<{ door: Door, file: string, label: string, promise: string, firstChapter: string }>}
 */
export const DOORS = Object.freeze([
  {
    door: 'a',
    file: 'business/',
    label: "I'm building a product or business",
    promise: 'products, MVPs and AI tools',
    firstChapter: '[data-chapter="mvp-sprints"]',
  },
  {
    door: 'b',
    file: 'family/',
    label: 'I want a site for me or my family',
    promise: 'your names, your photos, your dates',
    firstChapter: '[data-door-b-intro]',
  },
]);

/** How long the chosen file takes to open before the page glides on, in milliseconds. */
export const OPEN_MS = 650;
/** How long after the glide starts the fork returns to its two files (by then it is off screen). */
const SETTLE_MS = 1900;
/** How bright the code field flares when a file opens, and how long it takes to settle back. */
const SURGE = 2.6;
const SURGE_MS = 1700;

/**
 * The fork (spec section 4, step 3): two files to open, business/ and family/. Hovering or focusing a
 * file types its promise. Choosing one opens it full width while the other folds away, the code
 * field flares, and the page glides into that door's first chapter. With reduced motion the choice
 * applies at once and the page jumps there.
 */
export default function Fork() {
  const { door, setDoor } = useDoor();
  const reducedMotion = usePrefersReducedMotion();
  const [opening, setOpening] = useState(/** @type {Door | null} */ (null));

  useEffect(() => {
    if (!opening) return undefined;
    const option = DOORS.find((candidate) => candidate.door === opening);
    let frame = 0;
    let start = 0;
    /** @param {number} time */
    const surge = (time) => {
      if (!start) start = time;
      const k = Math.min(1, (time - start) / SURGE_MS);
      fieldBus.set({ intensity: 1 + (SURGE - 1) * (1 - k) * (1 - k) });
      if (k < 1) frame = requestAnimationFrame(surge);
    };
    if (!reducedMotion) frame = requestAnimationFrame(surge);
    const glide = window.setTimeout(
      () => {
        const chapter = option ? document.querySelector(option.firstChapter) : null;
        if (chapter) glideTo(chapter.getBoundingClientRect().top + window.scrollY, { instant: reducedMotion });
      },
      reducedMotion ? 0 : OPEN_MS,
    );
    const settle = window.setTimeout(() => setOpening(null), reducedMotion ? 0 : OPEN_MS + SETTLE_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(glide);
      window.clearTimeout(settle);
      fieldBus.set({ intensity: 1 });
    };
  }, [opening, reducedMotion]);

  const shown = opening ? DOORS.filter((option) => option.door === opening) : DOORS;

  return (
    <MotionConfig reducedMotion="user">
      <div role="group" aria-label="What brings you here?" className="grid w-full gap-5 sm:grid-cols-2 [perspective:1200px]">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((option) => {
            const chosen = door === option.door;
            const isOpening = opening === option.door;
            const promiseId = `fork-${option.door}-promise`;
            return (
              <motion.button
                key={option.door}
                layout
                type="button"
                aria-pressed={chosen}
                aria-describedby={promiseId}
                data-door-card={option.door}
                data-opening={isOpening ? 'true' : undefined}
                onClick={() => {
                  setDoor(option.door);
                  setOpening(option.door);
                }}
                exit={{ opacity: 0, rotateX: 55, scale: 0.92, transition: { duration: 0.35, ease: 'easeIn' } }}
                transition={{ layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                className={`group relative overflow-hidden rounded-xl border bg-night/85 text-left backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember ${
                  isOpening ? 'sm:col-span-2' : ''
                } ${chosen ? 'border-ember shadow-[0_0_40px_-12px_rgba(249,115,22,0.6)]' : 'border-white/15 hover:border-ember/70'}`}
              >
                {/* The file name and the promise are kept out of the button's name, which is the choice
                    itself; the promise is still read, as the button's description. */}
                <span
                  aria-hidden="true"
                  className="mono flex items-center justify-between border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55"
                >
                  <span>{option.file}</span>
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full transition-colors ${chosen ? 'bg-ember' : 'bg-white/20 group-hover:bg-ember/70'}`}
                  />
                </span>
                <span className="block px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
                  <span className="block font-serif-display text-3xl italic leading-tight text-white sm:text-4xl">
                    {option.label}
                  </span>
                  <span id={promiseId} aria-hidden="true" className="mono mt-6 flex items-center text-xs text-white/65">
                    <span aria-hidden="true" className="mr-2 text-ember">
                      &gt;
                    </span>
                    <span className="fork-type" data-shown={chosen || isOpening ? 'true' : undefined}>
                      {isOpening ? `opening ${option.file}` : option.promise}
                    </span>
                    <span aria-hidden="true" className="gate-cursor" />
                  </span>
                </span>
                {isOpening && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: OPEN_MS / 1000, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-ember/25 to-transparent"
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
