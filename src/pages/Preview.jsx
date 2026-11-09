// @ts-check
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { fieldBus, useField } from '../field/fieldBus.js';
import CodeBeside from '../field/CodeBeside.jsx';
import { editorSize } from '../field/editorMetrics.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { excerpts, getExcerpt } from '../content/excerpts/index.js';

const HEADLINE = 'We build software\nthat ships.';
const HEADLINE_COLOR = /** @type {[number, number, number]} */ ([0.96, 0.96, 0.95]);
// The canvas and the DOM headline share one size and line height so the handoff does not jump.
const HEADLINE_VW_DIVISOR = 8.5;
const HEADLINE_VH_DIVISOR = 4.2;
const HEADLINE_LINE_HEIGHT = 1.1;

/**
 * Plays the draft ambient excerpt onto the approved headline as the visitor scrolls through a tall
 * section, so the renderer can be reviewed before the real chapters exist (BLUEPRINT Phase 1).
 */
function RendererCheck() {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const isStatic = reducedMotion || mode === 'static';
  const [handoff, setHandoff] = useState(0);

  useEffect(() => {
    const excerpt = getExcerpt('ambient', { includeDrafts: true });
    const section = sectionRef.current;
    if (!excerpt || !section || isStatic) return undefined;

    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const editor = editorSize(excerpt.code);
      const fontPx = Math.min(w / HEADLINE_VW_DIVISOR, h / HEADLINE_VH_DIVISOR);
      const blockHeight = fontPx * HEADLINE_LINE_HEIGHT * 2;
      fieldBus.set({
        transform: {
          key: `renderer-check:${w}x${h}`,
          code: excerpt.code,
          sourceBox: { x: Math.max(24, (w - editor.w) / 2), y: Math.max(24, (h - editor.h) / 2), ...editor },
          text: HEADLINE,
          font: `italic 400 ${fontPx}px "Instrument Serif", Georgia, serif`,
          targetBox: { x: w * 0.04, y: (h - blockHeight) / 2, w: w * 0.92, h: blockHeight },
          step: Math.max(6, Math.round(fontPx / 14)),
          color: HEADLINE_COLOR,
        },
      });
    };
    let active = false;
    // The transformation plays only while its section is on screen.
    const update = () => {
      const rect = section.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if (visible !== active) {
        active = visible;
        if (visible) layout();
        else fieldBus.set({ transform: null, transformProgress: 0 });
      }
      const span = rect.height - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      fieldBus.set({ transformProgress: progress });
      setHandoff(Math.min(1, Math.max(0, (progress - 0.88) / 0.12)));
    };
    const onResize = () => {
      if (active) layout();
      update();
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      fieldBus.set({ transform: null, transformProgress: 0 });
    };
  }, [isStatic]);

  const excerpt = getExcerpt('ambient', { includeDrafts: true });
  if (isStatic && excerpt) {
    return (
      <section className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <CodeBeside
          excerpt={excerpt}
          result={
            <p className="whitespace-pre-line font-serif-display text-5xl italic leading-tight text-white sm:text-7xl">
              {HEADLINE}
            </p>
          }
        />
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-renderer-check className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6 lg:px-10">
        {/* The real headline takes over as the landed characters fade (FieldStage fades them from 0.92). */}
        <p
          aria-hidden="true"
          style={{
            opacity: handoff,
            fontSize: `min(calc(100vw / ${HEADLINE_VW_DIVISOR}), calc(100vh / ${HEADLINE_VH_DIVISOR}))`,
            lineHeight: HEADLINE_LINE_HEIGHT,
          }}
          className="whitespace-pre-line text-center font-serif-display italic text-white"
        >
          {HEADLINE}
        </p>
        <p className="mono absolute bottom-10 left-6 text-[10px] uppercase tracking-[0.3em] text-white/40 lg:left-10">
          Renderer check: draft excerpt usePageMeta.js lands on the approved headline
        </p>
      </div>
    </section>
  );
}

/**
 * Development route for the Source to Screen redesign: unlinked, noindex and disallowed in
 * robots.txt. BLUEPRINT Task 6.4 replaces it with the new home page.
 */
export default function Preview() {
  usePageMeta('Preview (not public) | Allen Code Co.', 'Development route for the Source to Screen redesign.', {
    noindex: true,
  });
  const drafts = Object.values(excerpts).filter((excerpt) => !excerpt.approved);

  return (
    <>
      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 lg:px-10">
        <p className="mono text-xs uppercase tracking-[0.3em] text-ember">Development route</p>
        <h1 className="mt-4 font-serif-display text-5xl italic leading-tight sm:text-7xl">Preview (not public)</h1>
        <p className="mt-6 max-w-xl text-white/60">
          The Source to Screen redesign is assembled here chapter by chapter and replaces the home page in
          Phase 6 of BLUEPRINT-SKY-REDESIGN.md. Scroll to review the field.
        </p>
        {drafts.length > 0 && (
          <p className="mono mt-6 text-xs text-white/50">
            Draft excerpts awaiting approval: {drafts.map((excerpt) => excerpt.file).join(', ')}
          </p>
        )}
        <Link
          to="/"
          className="mono mt-8 inline-flex w-fit text-xs uppercase tracking-widest text-white/70 hover:text-ember"
        >
          Back to the site
        </Link>
      </section>
      <RendererCheck />
    </>
  );
}
