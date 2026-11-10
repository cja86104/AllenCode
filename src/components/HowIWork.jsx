// @ts-check
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../field/environment.js';
import { commitTimeline } from '../scenes/chapterTimeline.js';
import { useSectionProgress } from '../scenes/useSectionProgress.js';

/** The three principles, verbatim from the previous home page. */
export const PRINCIPLES = Object.freeze([
  {
    n: '01',
    title: 'Solo, on purpose',
    body: 'No account managers, no subcontractors, no game of telephone. Every line of code, every architecture decision, every client conversation runs through one person who ships.',
  },
  {
    n: '02',
    title: 'Precision over speed-hacking',
    body: 'Fifteen years of hospitality taught me that a rushed plate always shows. The same discipline goes into error handling, data modeling, and the parts of software users never see but always feel.',
  },
  {
    n: '03',
    title: 'Acquisition-ready from day one',
    body: 'Clean commits, real documentation, sane architecture, and metrics a buyer can actually diligence — because a product built to be sold has to survive scrutiny from the first commit, not the last.',
  },
]);

/** @typedef {{ typed: number, body: number, shipped: boolean }} CommitState */

const SETTLED = Object.freeze({ typed: 1, body: 1, shipped: true });
/** Room the fixed nav takes at the top of the pinned frame, plus a margin, in CSS pixels. */
const NAV_ROOM = 72;

/**
 * One principle as a changelog entry. Its full text is always in the page; while it commits, the
 * part of the title not yet typed and the text not yet in are only made invisible.
 * @param {{ principle: (typeof PRINCIPLES)[number], state: CommitState, live: boolean, compact: boolean }} props
 */
function Entry({ principle, state, live, compact }) {
  const shown = Math.round(state.typed * principle.title.length);
  const typing = live && state.typed > 0 && state.typed < 1;
  return (
    <li
      data-principle={principle.n}
      data-shipped={state.shipped ? 'true' : undefined}
      className={`grid grid-cols-[auto_1fr] px-5 sm:gap-8 sm:px-8 ${compact ? 'gap-3 py-3' : 'gap-2 py-6'}`}
    >
      <span className={`mono text-sm transition-colors ${compact ? 'pt-1' : ''} ${state.typed > 0 ? 'text-ember' : 'text-white/55'}`}>
        <span aria-hidden="true">## </span>
        {principle.n}
      </span>
      <div>
        <h3 className={`font-serif-display italic leading-snug text-white ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
          {principle.title.slice(0, shown)}
          {typing && <span aria-hidden="true" className="gate-cursor" />}
          <span className="text-transparent">{principle.title.slice(shown)}</span>
        </h3>
        <p
          style={live ? { opacity: state.body, transform: `translateY(${(1 - state.body) * 12}px)` } : undefined}
          className={`mt-2 max-w-2xl text-white/65 ${compact ? 'text-[13px] leading-snug' : ''}`}
        >
          <span aria-hidden="true" className="mono mr-2 text-ember/80">
            +
          </span>
          {principle.body}
        </p>
        <p
          aria-hidden="true"
          style={live ? { opacity: state.shipped ? 1 : 0 } : undefined}
          className={`mono uppercase tracking-widest text-ember transition-opacity duration-300 ${compact ? 'mt-1 text-[10px]' : 'mt-2 text-[11px]'}`}
        >
          ✓ shipped
        </p>
      </div>
    </li>
  );
}

/**
 * How I work (spec section 4, step 6): the three principles as a changelog. As the visitor scrolls
 * the pinned chapter, each one commits in turn: its title types, its text slides in, and it is
 * marked shipped. With reduced motion the changelog is shown complete.
 */
export default function HowIWork() {
  const reducedMotion = usePrefersReducedMotion();
  const live = !reducedMotion;
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { progress, viewport } = useSectionProgress(sectionRef, live);
  const states = live ? commitTimeline(progress, PRINCIPLES.length) : PRINCIPLES.map(() => SETTLED);
  const compact = live && (viewport.w < 640 || viewport.h < 800);
  const contentRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [scale, setScale] = useState(1);

  // On short screens the whole changelog still has to fit the pinned frame, so it scales down to fit.
  useEffect(() => {
    const content = contentRef.current;
    if (!live || !content) return undefined;
    const fit = () => {
      const height = content.offsetHeight;
      setScale(height > 0 ? Math.min(1, (window.innerHeight - NAV_ROOM) / height) : 1);
    };
    const frame = requestAnimationFrame(fit);
    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', fit);
    };
  }, [live, compact]);

  const content = (
    <div
      ref={contentRef}
      style={live && scale < 1 ? { transform: `scale(${scale})` } : undefined}
      className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-10"
    >
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">How I Work</p>
      <h2
        className={`mt-4 max-w-3xl font-serif-display italic leading-tight text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}
      >
        Three rules that never bend.
      </h2>
      <div className={`overflow-hidden rounded-xl border border-white/10 bg-night/85 ${compact ? 'mt-5' : 'mt-10'}`}>
        <p aria-hidden="true" className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/60">
          CHANGELOG.md
        </p>
        <ol className="divide-y divide-white/10">
          {PRINCIPLES.map((principle, i) => (
            <Entry key={principle.n} principle={principle} state={states[i]} live={live} compact={compact} />
          ))}
        </ol>
      </div>
    </div>
  );

  if (!live) {
    return (
      <section data-chapter="how-i-work" className="relative z-10 py-16">
        {content}
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-chapter="how-i-work" className="relative h-[220vh]">
      {/* pt-14 keeps the chapter clear of the fixed nav. */}
      <div className="pin-frame sticky top-0 flex items-center overflow-hidden pt-14">{content}</div>
    </section>
  );
}
