// @ts-check
import { useEffect, useRef } from 'react';
import { fieldBus, useField } from '../field/fieldBus.js';
import { CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING, editorSize } from '../field/editorMetrics.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import CodeBeside from '../field/CodeBeside.jsx';
import CodeLines from '../field/CodeLines.jsx';
import { getExcerpt } from '../content/excerpts/index.js';
import { gateTimeline } from './gateTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { useHydrated } from '../ssr/useHydrated.js';
import {
  HEADLINE_COLOR,
  HEADLINE_FONT_SIZE_CSS,
  HEADLINE_LINE_HEIGHT,
  HEADLINE_LINES,
  headlineLayout,
} from './headline.js';

/**
 * The gate's transformation key; it changes with the viewport so the field rebuilds the layout.
 * @param {number} w
 * @param {number} h
 */
const gateKey = (w, h) => `gate:${w}x${h}`;

/** Approved copy (spec section 4). */
export const GATE_LINE = 'It all starts with an empty file…';
const TITLE_BAR_HEIGHT = 30;

/**
 * Editor scale that fits the code on narrow screens (1 at full size).
 * @param {string} code
 * @param {number} width
 */
function editorScale(code, width) {
  return Math.min(1, (width - 48) / editorSize(code).w);
}

/**
 * Where the editor's code area sits in a viewport: centered, clear of the edges and title bar.
 * @param {string} code
 * @param {number} width
 * @param {number} height
 * @returns {import('../field/types.js').Box}
 */
function editorBox(code, width, height) {
  const size = editorSize(code, editorScale(code, width));
  return {
    x: Math.max(24, (width - size.w) / 2),
    y: Math.max(24 + TITLE_BAR_HEIGHT, (height - size.h) / 2),
    ...size,
  };
}

/**
 * The gate's editor, its code and the line above it placed for any screen in CSS: `editorBox` and
 * `editorScale` written with `100vw` and `100dvh` (what `window.innerWidth` and `innerHeight`
 * measure, and the pinned frame's height). The prebuilt page and the browser's first pass use these,
 * so a phone's first paint is laid out for the phone before the scripts run (Phase 9); once the page
 * has hydrated the measured numbers take over, at the same places.
 * @param {string} code
 */
export function editorCss(code) {
  const full = editorSize(code);
  const room = 'calc(100vw - 48px)';
  /** A length that is `px` at full size and shrinks with the screen as `editorScale` does. @param {number} px */
  const scaled = (px) => `min(${px}px, calc(${room} * ${px / full.w}))`;
  const w = `min(${full.w}px, ${room})`;
  const h = scaled(full.h);
  const x = `max(24px, calc((100vw - ${w}) / 2))`;
  const y = `max(${24 + TITLE_BAR_HEIGHT}px, calc((100dvh - ${h}) / 2))`;
  return {
    line: { left: x, top: `max(8px, calc(${y} - ${TITLE_BAR_HEIGHT + 56}px))` },
    frame: { left: x, top: `calc(${y} - ${TITLE_BAR_HEIGHT}px)`, width: w, height: `calc(${h} + ${TITLE_BAR_HEIGHT}px)` },
    code: {
      left: `calc(${x} + ${scaled(EDITOR_PADDING)})`,
      top: `calc(${y} + ${scaled(EDITOR_PADDING)})`,
      fontSize: scaled(CODE_FONT_SIZE),
      lineHeight: scaled(CODE_LINE_HEIGHT),
    },
  };
}

/**
 * The approved headline as the page's h1. The lines keep a space between them so its accessible
 * name reads as one sentence.
 * @param {{ opacity: number, sized: boolean }} props
 */
function Headline({ opacity, sized }) {
  return (
    <h1
      // Pinned, it waits for the scroll to appear; without JavaScript index.html's <noscript> style shows it.
      data-reveal={sized ? true : undefined}
      style={sized ? { opacity, fontSize: HEADLINE_FONT_SIZE_CSS, lineHeight: HEADLINE_LINE_HEIGHT } : { opacity }}
      className={`text-center font-serif-display italic text-white ${sized ? '' : 'text-4xl leading-tight sm:text-5xl lg:text-left'}`}
    >
      {HEADLINE_LINES.map((line, i) => (
        <span key={line} className="block">
          {i > 0 ? ' ' : ''}
          {line}
        </span>
      ))}
    </h1>
  );
}

/**
 * Gate and awakening (spec section 4, steps 1 and 2): an empty editor and the approved line; scrolling
 * types this site's entry point into the file, then its characters lift and land as the headline,
 * and the real h1 takes over. Static (reduced motion, no WebGL): the code beside the headline.
 *
 * @param {{ includeDrafts: boolean }} props Whether unapproved excerpts may show (the public site passes false).
 */
export default function Gate({ includeDrafts }) {
  const excerpt = getExcerpt('gate', { includeDrafts });
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const isStatic = reducedMotion || mode === 'static' || !excerpt;
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { progress, visible, viewport } = useSectionProgress(sectionRef, !isStatic);
  const hydrated = useHydrated();

  // The transformation exists only while the gate is on screen.
  useEffect(() => {
    if (isStatic || !excerpt || !visible) return undefined;
    const { fontPx, targetBox, step } = headlineLayout(viewport.w, viewport.h);
    const key = gateKey(viewport.w, viewport.h);
    fieldBus.claimTransform({
      key,
      code: excerpt.code,
      sourceBox: editorBox(excerpt.code, viewport.w, viewport.h),
      codeScale: editorScale(excerpt.code, viewport.w),
      target: {
        kind: 'text',
        text: HEADLINE_LINES.join('\n'),
        font: `italic 400 ${fontPx}px "Instrument Serif", Georgia, serif`,
        color: HEADLINE_COLOR,
      },
      targetBox,
      step,
    });
    return () => fieldBus.releaseTransform(key);
  }, [isStatic, excerpt, visible, viewport.w, viewport.h]);

  const timeline = gateTimeline(progress);

  useEffect(() => {
    if (!isStatic && visible) fieldBus.setTransformProgress(gateKey(viewport.w, viewport.h), timeline.flight);
  }, [isStatic, visible, timeline.flight, viewport.w, viewport.h]);

  if (isStatic || !excerpt) {
    return (
      <section data-chapter="gate" className="relative mx-auto max-w-6xl px-6 pb-16 pt-24 lg:px-10">
        <p className="mono mb-10 text-xs uppercase tracking-[0.3em] text-ember">{GATE_LINE}</p>
        {excerpt ? (
          <CodeBeside excerpt={excerpt} result={<Headline opacity={1} sized={false} />} />
        ) : (
          <Headline opacity={1} sized={false} />
        )}
      </section>
    );
  }

  const scale = editorScale(excerpt.code, viewport.w);
  const box = editorBox(excerpt.code, viewport.w, viewport.h);
  // Until the page has hydrated the viewport is not measured yet, so the layout is CSS (editorCss).
  const css = hydrated ? null : editorCss(excerpt.code);
  const typed = Math.round(timeline.typed * excerpt.code.length);
  // Once the flight starts the renderer draws these characters in the same places, so the DOM copy
  // steps aside; until the renderer is running it stays.
  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-chapter="gate" data-noscript-unpin className="relative h-[280vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <p
          style={{ opacity: timeline.intro, ...(css ? css.line : { left: box.x, top: Math.max(8, box.y - TITLE_BAR_HEIGHT - 56) }) }}
          className="mono absolute text-xs uppercase tracking-[0.3em] text-ember"
        >
          {GATE_LINE}
        </p>

        <div
          aria-hidden="true"
          data-editor-frame
          data-noscript-hide
          style={{
            opacity: frameOpacity,
            ...(css
              ? css.frame
              : { left: box.x, top: box.y - TITLE_BAR_HEIGHT, width: box.w, height: box.h + TITLE_BAR_HEIGHT }),
          }}
          className="absolute rounded-xl border border-white/10 bg-night/70"
        >
          <div
            style={{ height: TITLE_BAR_HEIGHT }}
            className="mono flex items-center border-b border-white/10 px-4 text-[11px] tracking-widest text-white/60"
          >
            {excerpt.file}
          </div>
        </div>

        <pre
          data-editor-code
          data-noscript-hide
          aria-hidden="true"
          style={{
            opacity: codeOpacity,
            ...(css
              ? css.code
              : {
                  left: box.x + EDITOR_PADDING * scale,
                  top: box.y + EDITOR_PADDING * scale,
                  fontSize: CODE_FONT_SIZE * scale,
                  lineHeight: `${CODE_LINE_HEIGHT * scale}px`,
                }),
          }}
          className="mono absolute m-0 whitespace-pre [font-variant-ligatures:none]"
        >
          <CodeLines code={excerpt.code} visible={typed} />
          {timeline.flight === 0 && <span className="gate-cursor" />}
        </pre>

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <Headline opacity={timeline.handoff} sized />
        </div>

        <p
          data-noscript-hide
          style={{ opacity: timeline.intro }}
          className="mono absolute bottom-8 left-0 right-0 text-center text-xs uppercase tracking-[0.35em] text-white/80"
        >
          Scroll to enter
        </p>
      </div>
    </section>
  );
}
