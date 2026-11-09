// @ts-check
import { useRef } from 'react';
import { templates } from '../data/templates.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { DOOR_B_INTRO } from '../content/doorB.js';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import MediaLoop from '../components/MediaLoop.jsx';
import { chapterTimeline } from './chapterTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {{ src: string, poster: string, alt: string }} Loop */

/** The template loops are 1280 x 800. */
const LOOP_SIZE = { width: 1280, height: 800 };

/**
 * Door B's opening words. `compact` keeps only the first paragraph, for a pinned chapter on a phone.
 * @param {{ compact?: boolean }} props
 */
function IntroText({ compact = false }) {
  const body = compact ? DOOR_B_INTRO.body.slice(0, 1) : DOOR_B_INTRO.body;
  return (
    <div>
      <p className="mono text-[11px] uppercase tracking-[0.3em] text-ember">{DOOR_B_INTRO.eyebrow}</p>
      <h2 className="mt-4 font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{DOOR_B_INTRO.title}</h2>
      {body.map((paragraph) => (
        <p key={paragraph} className="mt-5 max-w-xl text-white/70">
          {paragraph}
        </p>
      ))}
      {!compact && <p className="mono mt-6 text-xs uppercase tracking-[0.2em] text-white/45">{DOOR_B_INTRO.note}</p>}
    </div>
  );
}

/**
 * The Hearth preview's code flies onto the Hearth poster: a family's name, a picture and their
 * news. Then the loop plays.
 * @param {{ excerpt: Excerpt, loop: Loop }} props
 */
function FlightIntro({ excerpt, loop }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mode } = useField();
  const { progress, visible, viewport } = useSectionProgress(sectionRef, true);
  const screen = { src: loop.poster, alt: loop.alt, ...LOOP_SIZE };
  const { text, sourceBox, codeScale, targetBox } = flightGeometry(excerpt.code, screen, viewport.w, viewport.h);
  const timeline = chapterTimeline(progress);
  useImageFlight({ slug: 'door-b-intro', code: excerpt.code, screen, visible, viewport, flight: timeline.flight });

  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-door-b-intro className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
          <IntroText compact={viewport.w < DESKTOP_MIN_WIDTH} />
        </div>
        <FlightEditor
          file={excerpt.file}
          code={excerpt.code}
          sourceBox={sourceBox}
          codeScale={codeScale}
          codeOpacity={codeOpacity}
          frameOpacity={frameOpacity}
        />
        <div
          style={{ opacity: timeline.handoff, left: targetBox.x, top: targetBox.y, width: targetBox.w, height: targetBox.h }}
          className="absolute"
        >
          <MediaLoop {...loop} active={timeline.handoff >= 1} className="h-full w-full rounded-lg shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

/**
 * Door B's first chapter, "What I can make you" (spec section 4, step 4B): plain words beside real
 * code that becomes a family's home page. Without the renderer or with reduced motion, the code sits
 * beside the page it becomes.
 * @param {{ includeDrafts: boolean }} props Whether unapproved excerpts may show (the public site passes false).
 */
export default function DoorBIntro({ includeDrafts }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const hearth = templates.find((t) => t.id === 'hearth');
  if (!hearth) throw new Error('templates.js has no "hearth" template.');
  const excerpt = getExcerpt(hearth.excerpt, { includeDrafts });
  const loop = {
    src: hearth.previewVideo,
    poster: hearth.poster,
    alt: 'Hearth, a family home page: the Harper family’s name, a drawn landscape and their latest news',
  };

  if (!reducedMotion && mode === 'webgl' && excerpt) return <FlightIntro excerpt={excerpt} loop={loop} />;

  return (
    <section
      data-door-b-intro
      className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10"
    >
      <IntroText />
      <div className="min-w-0 space-y-6">
        {excerpt && <EditorPanel excerpt={excerpt} />}
        <MediaLoop {...loop} className="rounded-lg shadow-2xl" />
      </div>
    </section>
  );
}
