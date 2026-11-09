// @ts-check
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fieldBus, useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { CODE_CHAR_WIDTH, CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING } from '../field/editorMetrics.js';
import { sketchShapes } from '../field/layouts.js';
import CodeLines from '../field/CodeLines.jsx';
import { IDEA_CHAPTER } from '../content/visitorTurn.js';
import { IDEA_MAX_LENGTH, capIdea, sketchBlocks, wrapIdea } from './sketchBlocks.js';

/** @typedef {import('./sketchBlocks.js').SketchBlock} SketchBlock */

/** How long the visitor's line takes to fly into its sketch, in milliseconds. */
export const IDEA_FLIGHT_MS = 2600;
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
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [flight, setFlight] = useState(1);
  // Each submission's line and blocks, captured together so its flight plays exactly what was submitted.
  const [launch, setLaunch] = useState(/** @type {{ id: number, code: string, blocks: SketchBlock[] } | null} */ (null));
  const codeRef = useRef(/** @type {HTMLPreElement | null} */ (null));
  const sketchRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const blocks = sketchBlocks(idea);

  // The editor shows the line wrapped to its width; rewrap when the width changes.
  useEffect(() => {
    const rewrap = () => setCode(idea ? wrapIdea(idea, columnsIn(codeRef.current)) : '');
    const frame = requestAnimationFrame(rewrap);
    window.addEventListener('resize', rewrap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', rewrap);
    };
  }, [idea]);

  // One flight per submission: the line's characters lift off the editor and land on the sketch.
  // Scrolling during the flight finishes it, so the characters never land somewhere the sketch is not.
  useEffect(() => {
    if (!launch || !animate || !launch.code) return undefined;
    const pre = codeRef.current;
    const sketch = sketchRef.current;
    if (!pre || !sketch) return undefined;
    const key = `idea:${launch.id}`;
    fieldBus.claimTransform({
      key,
      code: launch.code,
      sourceBox: boxOf(pre.getBoundingClientRect()),
      codeScale: 1,
      target: { kind: 'sketch', blocks: launch.blocks },
      targetBox: boxOf(sketch.getBoundingClientRect()),
      step: Math.max(4, Math.round(sketch.clientWidth / 110)),
    });
    let frame = 0;
    let start = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      setFlight(1);
      fieldBus.releaseTransform(key);
      window.removeEventListener('scroll', finish);
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
    window.addEventListener('scroll', finish, { passive: true });
    return finish;
  }, [launch, animate]);

  const submit = useCallback(
    (/** @type {import('react').FormEvent<HTMLFormElement>} */ event) => {
      event.preventDefault();
      const next = capIdea(draft);
      if (!next) {
        setError(IDEA_CHAPTER.empty);
        return;
      }
      const wrapped = wrapIdea(next, columnsIn(codeRef.current));
      setError('');
      setDraft(next);
      setIdea(next);
      setCode(wrapped);
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set(IDEA_PARAM, next);
          return params;
        },
        { replace: true, preventScrollReset: true },
      );
      setFlight(animate ? 0 : 1);
      if (animate) setLaunch({ id: (launch?.id ?? 0) + 1, code: wrapped, blocks: sketchBlocks(next) });
    },
    [draft, animate, launch, setSearchParams],
  );

  const flying = flight < 1;
  const codeOpacity = flying && flight > 0 ? 0 : 1;
  // The sketch resolves through the landed characters over the last 12 percent of the flight.
  const sketchOpacity = !idea ? 0.25 : flying ? Math.max(0, (flight - 0.88) / 0.12) : 1;

  return (
    <section id="your-idea" data-chapter="idea" className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{IDEA_CHAPTER.eyebrow}</p>
      <h2 className="mt-4 max-w-3xl font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">
        {IDEA_CHAPTER.title}
      </h2>
      <p className="mt-5 max-w-2xl text-white/70">{IDEA_CHAPTER.body}</p>

      <form onSubmit={submit} noValidate className="mt-8 max-w-2xl">
        <label htmlFor="idea-input" className="mono text-[11px] uppercase tracking-widest text-white/60">
          {IDEA_CHAPTER.label}
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="idea-input"
            name={IDEA_PARAM}
            value={draft}
            maxLength={IDEA_MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={IDEA_CHAPTER.placeholder}
            autoComplete="off"
            aria-describedby={error ? 'idea-count idea-error' : 'idea-count'}
            aria-invalid={error ? true : undefined}
            className="input flex-1 !bg-night/95"
          />
          <button
            type="submit"
            className="mono rounded-full bg-ember px-6 py-3 text-xs uppercase tracking-widest text-night hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
          >
            {IDEA_CHAPTER.submit}
          </button>
        </div>
        <p id="idea-count" className="mono mt-2 text-[11px] text-white/45">
          {draft.length} / {IDEA_MAX_LENGTH}
        </p>
        {error && (
          <p id="idea-error" role="alert" className="mt-1 text-sm text-ember">
            {error}
          </p>
        )}
      </form>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
          <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
            {IDEA_CHAPTER.file}
          </div>
          <pre
            ref={codeRef}
            data-idea-code
            style={{
              padding: EDITOR_PADDING,
              fontSize: CODE_FONT_SIZE,
              lineHeight: `${CODE_LINE_HEIGHT}px`,
              minHeight: CODE_LINE_HEIGHT + EDITOR_PADDING * 2,
            }}
            className="mono m-0 whitespace-pre [font-variant-ligatures:none]"
          >
            <span style={{ opacity: codeOpacity }}>
              <CodeLines code={code} />
            </span>
            {!idea && <span aria-hidden="true" className="gate-cursor" />}
          </pre>
        </div>

        <figure className="rounded-xl border border-white/10 bg-night/60 p-4">
          <Sketch blocks={blocks} opacity={sketchOpacity} sketchRef={sketchRef} />
          <figcaption className="mt-4">
            {idea ? (
              <>
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
              </>
            ) : (
              <span className="mono text-[11px] uppercase tracking-widest text-white/45">{IDEA_CHAPTER.waiting}</span>
            )}
          </figcaption>
        </figure>
      </div>

      {idea && (
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
