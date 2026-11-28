// @ts-check
import { useRef } from 'react';
import { templates } from '../data/templates.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { DOOR_B_INTRO } from '../content/doorB.js';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import MediaLoop from '../components/MediaLoop.jsx';
import { chapterTimeline } from './chapterTimeline.js';
import { CHAPTER_BODY, CHAPTER_GRID, CHAPTER_LABEL, CHAPTER_TITLE } from './chapterType.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';
import { useWordsFloor } from '../pathbar/pathBarStore.js';
import { LayerChapter } from './layerSlot.jsx';

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
      <p className={`tracking-[0.3em] text-ember ${CHAPTER_LABEL}`}>{DOOR_B_INTRO.eyebrow}</p>
      <h2 className={`mt-4 ${CHAPTER_TITLE}`}>{DOOR_B_INTRO.title}</h2>
      {body.map((paragraph) => (
        <p key={paragraph} className={`mt-5 max-w-xl lg:max-w-none ${CHAPTER_BODY}`}>
          {paragraph}
        </p>
      ))}
      {!compact && <p className={`mt-6 tracking-[0.2em] text-white/60 ${CHAPTER_LABEL}`}>{DOOR_B_INTRO.note}</p>}
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
  // Below the path bar while it shows (Living Source Phase 3).
  const wordsFloor = useWordsFloor(viewport.w);
  const screen = { src: loop.poster, alt: loop.alt, ...LOOP_SIZE };
  const { text, sourceBox, codeScale, targetBox } = flightGeometry(excerpt.code, screen, viewport.w, viewport.h);
  const timeline = chapterTimeline(progress);
  useImageFlight({ slug: 'door-b-intro', code: excerpt.code, screen, visible, viewport, flight: timeline.flight });

  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-door-b-intro className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div data-world-words style={{ left: text.x, top: Math.max(text.y, wordsFloor), width: text.w }} className="absolute">
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
          data-world-target
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
 * Hearth's excerpt and loop, for door B's first chapter.
 * @param {boolean} includeDrafts
 * @returns {{ excerpt: Excerpt | null, loop: Loop }}
 */
function hearthChapter(includeDrafts) {
  const hearth = templates.find((t) => t.id === 'hearth');
  if (!hearth) throw new Error('templates.js has no "hearth" template.');
  return {
    excerpt: getExcerpt(hearth.excerpt, { includeDrafts }),
    loop: {
      src: hearth.previewVideo,
      poster: hearth.poster,
      alt: 'Hearth, a family home page: the Harper family’s name, a drawn landscape and their latest news',
    },
  };
}

/**
 * Door B's first chapter as the Code World's family road plays it (W3.4): today's flight chapter,
 * at Hearth's landmark. Only the world renders it, so it is always the flight.
 * @param {{ includeDrafts: boolean }} props
 */
export function DoorBIntroFor({ includeDrafts }) {
  const { excerpt, loop } = hearthChapter(includeDrafts);
  return excerpt ? <FlightIntro excerpt={excerpt} loop={loop} /> : null;
}

/**
 * Door B's first chapter, "What I can make you" (spec section 4, step 4B): plain words beside real
 * code that becomes a family's home page. Without the renderer or with reduced motion, the code sits
 * beside the page it becomes.
 * With `layers` (the world off) it takes C's layer stack (Living Source Phase 4).
 * @param {{ includeDrafts: boolean, layers?: boolean }} props Whether unapproved excerpts may show (the public site
 *   passes false), and whether it takes the layer stack.
 */
export default function DoorBIntro({ includeDrafts, layers = false }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const { excerpt, loop } = hearthChapter(includeDrafts);

  if (layers && excerpt) {
    return (
      <LayerChapter
        attrs={{ 'data-door-b-intro': true }}
        excerpt={excerpt}
        screen={{ src: loop.poster, alt: loop.alt, ...LOOP_SIZE, video: loop.src }}
        motion={!reducedMotion && mode === 'webgl'}
        words={({ compact }) => <IntroText compact={compact} />}
      />
    );
  }

  if (!reducedMotion && mode === 'webgl' && excerpt) return <FlightIntro excerpt={excerpt} loop={loop} />;

  return (
    <section
      data-door-b-intro
      className={`relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 ${CHAPTER_GRID} lg:items-center lg:px-10`}
    >
      <IntroText />
      <div className="min-w-0 space-y-6">
        {excerpt && <EditorPanel excerpt={excerpt} />}
        <MediaLoop {...loop} className="rounded-lg shadow-2xl" />
      </div>
    </section>
  );
}
