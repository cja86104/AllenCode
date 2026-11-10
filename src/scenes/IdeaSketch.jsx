// @ts-check
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fieldBus, useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { CODE_CHAR_WIDTH, CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING } from '../field/editorMetrics.js';
import { sketchShapes } from '../field/layouts.js';
import { IDEA_CHAPTER } from '../content/visitorTurn.js';
import { IDEA_MAX_LENGTH, capIdea, sketchBlocks, wrapIdea } from './sketchBlocks.js';

/** @typedef {import('./sketchBlocks.js').SketchBlock} SketchBlock */

/** How long the visitor's line takes to fly into its sketch, in milliseconds. */
export const IDEA_FLIGHT_MS = 2600;
/** How fast the example types itself, per character, and the pause before it flies. */
export const DEMO_TYPE_MS = 55;
const DEMO_PAUSE_MS = 450;
/** Scrolling further than this during a flight finishes it, so a small nudge does not cut it short. */
const SCROLL_FINISH_PX = 120;
/** The query parameter that carries the idea to the brief. */
export const IDEA_PARAM = 'idea';
/** The sketch's drawing space; shapes are placed as percentages of it, so it scales with the page. */
const SKETCH_SPACE = Object.freeze({ x: 0, y: 0, w: 100, h: 75 });

/** @type {Readonly<Record<import('../field/layouts.js').SketchTone, string>>} */
const TONE_CLASSES = Object.freeze({
  line: 'border border-white/35',
  fill: 'bg-white/45',
  accent: 'bg-ember',
});

/** Editor columns used before the editor has been laid out. */
const DEFAULT_COLUMNS = 40;

/**
 * How many editor columns fit in an element.
 * @param {HTMLElement | null} el
 * @returns {number}
 */
function columnsIn(el) {
  if (!el || el.clientWidth === 0) return DEFAULT_COLUMNS;
  return Math.max(8, Math.floor((el.clientWidth - EDITOR_PADDING * 2) / CODE_CHAR_WIDTH));
}

/**
 * @param {DOMRect} rect
 * @returns {import('../field/types.js').Box}
 */
function boxOf(rect) {
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

/**
 * The wireframe of an idea, drawn from the same shapes the characters land on.
 * @param {{ blocks: SketchBlock[], opacity: number, sketchRef: import('react').Ref<HTMLDivElement> }} props
 */
function Sketch({ blocks, opacity, sketchRef }) {
  const placed = sketchShapes(blocks, SKETCH_SPACE);
  return (
    <div ref={sketchRef} aria-hidden="true" data-sketch className="relative aspect-[4/3] w-full">
      <div style={{ opacity }} className="absolute inset-0">
        {placed.flatMap(({ block, shapes }) =>
          shapes.map((shape, i) => (
            <div
              key={`${block.kind}-${i}`}
              data-tone={shape.tone}
              style={{
                left: `${shape.x}%`,
                top: `${(shape.y / SKETCH_SPACE.h) * 100}%`,
                width: `${shape.w}%`,
                height: `${(shape.h / SKETCH_SPACE.h) * 100}%`,
              }}
              className={`absolute rounded-[2px] ${TONE_CLASSES[shape.tone]}`}
            />
          )),
        )}
      </div>
    </div>
  );
}

/**
 * "Type your idea" (spec section 4, step 8). A labeled form field that works with no animation:
 * submitting turns the line into a sketch (header, hero, call to action, plus blocks the words ask
 * for) and puts it in the address bar, where the brief picks it up as its first line. With the
 * glyph renderer running, the line's own characters fly from the editor into the sketch.
 */
export default function IdeaSketch() {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const animate = !reducedMotion && mode === 'webgl';
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState(() => capIdea(searchParams.get(IDEA_PARAM) ?? ''));
  const [idea, setIdea] = useState(() => capIdea(searchParams.get(IDEA_PARAM) ?? ''));
  const [error, setError] = useState('');
  const [flight, setFlight] = useState(1);
  // Each submission's line and blocks, captured together so its flight plays exactly what was submitted.
  const [launch, setLaunch] = useState(/** @type {{ id: number, code: string, blocks: SketchBlock[] } | null} */ (null));
  // The example plays itself once when the chapter comes into view, until the visitor types their own.
  const [demo, setDemo] = useState(false);
  const fileRef = useRef(/** @type {HTMLTextAreaElement | null} */ (null));
  const sketchRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const stopDemo = useRef(() => {});
  const demoPlayed = useRef(false);

  const blocks = sketchBlocks(idea);

  // One flight per submission: the line's characters lift off the editor and land on the sketch.
  // Scrolling during the flight finishes it, so the characters never land somewhere the sketch is not.
  useEffect(() => {
    if (!launch || !animate || !launch.code) return undefined;
    const file = fileRef.current;
    const sketch = sketchRef.current;
    if (!file || !sketch) return undefined;
    const key = `idea:${launch.id}`;
    fieldBus.claimTransform({
      key,
      code: launch.code,
      sourceBox: boxOf(file.getBoundingClientRect()),
      codeScale: 1,
      target: { kind: 'sketch', blocks: launch.blocks },
      targetBox: boxOf(sketch.getBoundingClientRect()),
      step: Math.max(4, Math.round(sketch.clientWidth / 110)),
    });
    let frame = 0;
    let start = 0;
    const startY = window.scrollY;
    const finish = () => {
      cancelAnimationFrame(frame);
      setFlight(1);
      fieldBus.releaseTransform(key);
      window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > SCROLL_FINISH_PX) finish();
    };
    /** @param {number} time */
    const tick = (time) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / IDEA_FLIGHT_MS);
      setFlight(progress);
      fieldBus.setTransformProgress(key, progress);
      if (progress >= 1) finish();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return finish;
  }, [launch, animate]);

  /**
   * Turns a line into its sketch, flying its characters when the renderer runs. A visitor's own line
   * goes into the address for the brief; the example does not.
   */
  const sketchIdea = useCallback(
    (/** @type {string} */ next, /** @type {boolean} */ isDemo) => {
      // The file wraps at spaces like the browser wraps the field, so the characters lift from where they are.
      const wrapped = wrapIdea(next, columnsIn(fileRef.current));
      setError('');
      setDraft(next);
      setIdea(next);
      setDemo(isDemo);
      if (!isDemo) {
        setSearchParams(
          (current) => {
            const params = new URLSearchParams(current);
            params.set(IDEA_PARAM, next);
            return params;
          },
          { replace: true, preventScrollReset: true },
        );
      }
      setFlight(animate ? 0 : 1);
      if (animate) setLaunch((last) => ({ id: (last?.id ?? 0) + 1, code: wrapped, blocks: sketchBlocks(next) }));
    },
    [animate, setSearchParams],
  );

  // The example: once the chapter is well in view, the placeholder line types itself into the file
  // and flies into its sketch, so the chapter shows what it does before anyone types.
  const hasIdea = Boolean(idea);
  useEffect(() => {
    const section = sectionRef.current;
    if (!animate || hasIdea || demoPlayed.current || !section || typeof IntersectionObserver === 'undefined') return undefined;
    /** @type {number[]} */
    const timers = [];
    let started = false;
    const stop = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.length = 0;
    };
    const play = () => {
      demoPlayed.current = true;
      const line = IDEA_CHAPTER.placeholder;
      setDemo(true);
      for (let n = 1; n <= line.length; n += 1) {
        timers.push(window.setTimeout(() => setDraft(line.slice(0, n)), n * DEMO_TYPE_MS));
      }
      timers.push(window.setTimeout(() => sketchIdea(line, true), line.length * DEMO_TYPE_MS + DEMO_PAUSE_MS));
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (started || !entry?.isIntersecting) return;
        started = true;
        observer.disconnect();
        play();
      },
      { threshold: 0.45 },
    );
    observer.observe(section);
    stopDemo.current = stop;
    return () => {
      observer.disconnect();
      stop();
    };
  }, [animate, hasIdea, sketchIdea]);

  // Clicking into the file hands it to the visitor: the example stops and clears.
  const takeOver = useCallback(() => {
    if (!demo) return;
    stopDemo.current();
    setDemo(false);
    setDraft('');
    setIdea('');
    setFlight(1);
  }, [demo]);

  const submit = useCallback(
    (/** @type {import('react').FormEvent<HTMLFormElement>} */ event) => {
      event.preventDefault();
      const next = capIdea(draft);
      if (!next) {
        setError(IDEA_CHAPTER.empty);
        return;
      }
      sketchIdea(next, false);
    },
    [draft, sketchIdea],
  );

  const flying = flight < 1;
  // While the characters are in the air the file's own text steps aside.
  const textHidden = flying && flight > 0;
  // The sketch resolves through the landed characters over the last 12 percent of the flight.
  const sketchOpacity = !idea ? 0.25 : flying ? Math.max(0, (flight - 0.88) / 0.12) : 1;

  return (
    <section ref={sectionRef} id="your-idea" data-chapter="idea" data-demo={demo ? 'true' : undefined} className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{IDEA_CHAPTER.eyebrow}</p>
      <h2 className="mt-4 max-w-3xl font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">
        {IDEA_CHAPTER.title}
      </h2>
      <p className="mt-5 max-w-2xl text-white/70">{IDEA_CHAPTER.body}</p>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start">
        <div>
          <label htmlFor="idea-input" className="mono text-[11px] uppercase tracking-widest text-white/60">
            {IDEA_CHAPTER.label}
          </label>
          <div className="mt-2 overflow-hidden rounded-xl border border-white/15 bg-night/95 transition-colors focus-within:border-ember">
            <div className="mono flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
              <span>{IDEA_CHAPTER.file}</span>
              <span aria-hidden="true" data-idea-hint className="text-ember/80">
                {demo ? IDEA_CHAPTER.demoNote : IDEA_CHAPTER.typeHere}
              </span>
            </div>
            <textarea
              ref={fileRef}
              id="idea-input"
              name={IDEA_PARAM}
              value={draft}
              rows={4}
              maxLength={IDEA_MAX_LENGTH}
              onFocus={takeOver}
              onChange={(event) => setDraft(event.target.value.replace(/[\r\n]+/g, ' '))}
              onKeyDown={(event) => {
                // One line: Enter sketches it instead of starting a new line.
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={IDEA_CHAPTER.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? 'idea-count idea-error' : 'idea-count'}
              aria-invalid={error ? true : undefined}
              data-idea-code
              style={{
                padding: EDITOR_PADDING,
                fontSize: CODE_FONT_SIZE,
                lineHeight: `${CODE_LINE_HEIGHT}px`,
                color: textHidden ? 'transparent' : undefined,
              }}
              className="mono block w-full resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-white caret-ember outline-none [font-variant-ligatures:none] [overflow-wrap:anywhere] placeholder:text-white/35"
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p id="idea-count" className="mono text-[11px] text-white/45">
              {draft.length} / {IDEA_MAX_LENGTH}
            </p>
            <button
              type="submit"
              className="mono rounded-full bg-ember px-6 py-3 text-xs uppercase tracking-widest text-night hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
            >
              {IDEA_CHAPTER.submit}
            </button>
          </div>
          {error && (
            <p id="idea-error" role="alert" className="mt-2 text-sm text-ember">
              {error}
            </p>
          )}
        </div>

        <figure className="m-0 rounded-xl border border-white/10 bg-night/60 p-4">
          <Sketch blocks={blocks} opacity={sketchOpacity} sketchRef={sketchRef} />
          <figcaption className="mt-4">
            {idea ? (
              <ul aria-label={IDEA_CHAPTER.sketchCaption} data-sketch-blocks className="flex flex-wrap gap-2">
                {blocks.map((block) => (
                  <li
                    key={block.kind}
                    className="mono rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-widest text-white/70"
                  >
                    {block.label}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="mono text-[11px] uppercase tracking-widest text-white/45">{IDEA_CHAPTER.waiting}</span>
            )}
          </figcaption>
        </figure>
      </form>

      {idea && !demo && (
        <p className="mt-8 text-white/70">
          {IDEA_CHAPTER.carried}{' '}
          <a href="#brief" className="mono text-xs uppercase tracking-widest text-ember hover:text-orange-400">
            {IDEA_CHAPTER.carriedLink}
          </a>
        </p>
      )}
      <p className="mt-3 text-sm text-white/50">{IDEA_CHAPTER.note}</p>
    </section>
  );
}
