// @ts-check
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { templates } from '../data/templates.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { TEMPLATE_CHAPTER, TEMPLATE_STORIES } from '../content/doorB.js';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import MediaLoop from '../components/MediaLoop.jsx';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {(typeof templates)[number]} Template */

const DOOR_B_CATEGORIES = ['Family and Memories', 'Events', 'Personal and Creative'];

/** Door B's templates after Hearth, which the intro already shows, in catalog order. */
export const DOOR_B_TEMPLATES = Object.freeze(templates.filter((t) => DOOR_B_CATEGORIES.includes(t.category) && t.id !== 'hearth'));

/** The template loops are 1280 x 800. */
const LOOP_SIZE = { width: 1280, height: 800 };

/** Scroll given to each template, in viewport heights. */
const SEGMENT_VH = 90;

const clamp01 = (/** @type {number} */ x) => Math.min(1, Math.max(0, x));

/**
 * One template's part of the pinned chapter: the code holds for the first 15 percent so it can be
 * read, flies onto the poster by 65 percent, and the loop plays for the rest.
 * @param {number} local 0..1 through the template's segment
 */
export function segmentTimeline(local) {
  const flight = clamp01((local - 0.15) / 0.5);
  return { flight, handoff: clamp01((flight - 0.88) / 0.12) };
}

/** @param {Template} template */
function loopOf(template) {
  const title = template.name.split(' — ')[0];
  return { src: template.previewVideo, poster: template.poster, alt: `${title}, a concept preview of the ${template.category.toLowerCase()} template` };
}

/**
 * The words beside one template: its name, what it is for, and the way to ask about it.
 * @param {{ template: Template, compact?: boolean }} props
 */
function TemplateText({ template, compact = false }) {
  const [title, kind] = template.name.split(' — ');
  return (
    <div>
      <p className="mono text-[11px] uppercase tracking-[0.25em] text-ember">{template.category}</p>
      <h3 className="mt-3 font-serif-display text-4xl italic leading-tight text-white">{title}</h3>
      <p className="mono mt-1 text-xs uppercase tracking-[0.2em] text-white/50">{kind}</p>
      {!compact && <p className="mt-4 max-w-md text-white/70">{TEMPLATE_STORIES[template.id]}</p>}
      {template.status === 'concept' && !compact && (
        <p className="mono mt-4 text-[10px] uppercase tracking-[0.2em] text-white/45">Concept preview, coming soon</p>
      )}
      <Link
        to={`/contact?template=${template.id}`}
        className="mono mt-5 inline-flex items-center gap-2 rounded-full border border-ember/60 px-4 py-2 text-[11px] uppercase tracking-widest text-ember hover:bg-ember hover:text-black"
      >
        Ask about this template<span aria-hidden="true"> ↗</span>
      </Link>
    </div>
  );
}

function ChapterHeading() {
  return (
    <div>
      <p className="mono text-[11px] uppercase tracking-[0.3em] text-ember">{TEMPLATE_CHAPTER.eyebrow}</p>
      <h2 className="mt-3 font-serif-display text-3xl italic leading-tight text-white sm:text-4xl">{TEMPLATE_CHAPTER.title}</h2>
    </div>
  );
}

function AllTemplatesLink() {
  return (
    <Link to="/templates" className="mono text-[11px] uppercase tracking-[0.25em] text-white/60 underline-offset-4 hover:text-ember hover:underline">
      {TEMPLATE_CHAPTER.allLink}
      <span aria-hidden="true"> →</span>
    </Link>
  );
}

/**
 * The flight for one template. It always runs its hooks but only claims the field and draws while
 * it is the active segment.
 * @param {{ template: Template, excerpt: Excerpt, local: number, active: boolean, visible: boolean, viewport: { w: number, h: number }, mode: string, index: number, count: number }} props
 */
function TemplateSegment({ template, excerpt, local, active, visible, viewport, mode, index, count }) {
  const loop = loopOf(template);
  const screen = { src: loop.poster, alt: loop.alt, ...LOOP_SIZE };
  const { text, sourceBox, codeScale, targetBox } = flightGeometry(excerpt.code, screen, viewport.w, viewport.h);
  const timeline = segmentTimeline(active ? local : 0);
  useImageFlight({ slug: `template-${template.id}`, code: excerpt.code, screen, visible: visible && active, viewport, flight: timeline.flight });
  if (!active) return null;

  const compact = viewport.w < DESKTOP_MIN_WIDTH;
  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <div data-door-b-template={template.id}>
      <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
        <ChapterHeading />
        <div className={compact ? 'mt-4' : 'mt-10'}>
          <TemplateText template={template} compact={compact} />
        </div>
        <p className="mono mt-6 text-[11px] tracking-[0.25em] text-white/40">
          {index + 1} / {count}
        </p>
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
  );
}

/**
 * Door B's templates, one after another in a single pinned chapter: each file compiles into its
 * preview (spec section 4, step 5B).
 * @param {{ items: { template: Template, excerpt: Excerpt }[] }} props
 */
function FlightTemplateChapter({ items }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mode } = useField();
  const { progress, visible, viewport } = useSectionProgress(sectionRef, true);
  const count = items.length;
  const active = Math.min(count - 1, Math.floor(progress * count));
  const local = Math.min(1, progress * count - active);

  return (
    <section ref={sectionRef} data-template-chapter style={{ height: `${count * SEGMENT_VH + 100}vh` }} className="relative">
      <div className="pin-frame sticky top-0 overflow-hidden">
        {items.map(({ template, excerpt }, index) => (
          <TemplateSegment
            key={template.id}
            template={template}
            excerpt={excerpt}
            local={local}
            active={index === active}
            visible={visible}
            viewport={viewport}
            mode={mode}
            index={index}
            count={count}
          />
        ))}
        <div className="absolute bottom-8 left-[6%]">
          <AllTemplatesLink />
        </div>
      </div>
    </section>
  );
}

/**
 * Door B's template chapter. Without the renderer or with reduced motion, each template's code sits
 * beside its preview.
 * @param {{ includeDrafts: boolean }} props Whether unapproved excerpts may show (the public site passes false).
 */
export default function TemplateChapter({ includeDrafts }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const items = DOOR_B_TEMPLATES.flatMap((template) => {
    const excerpt = getExcerpt(template.excerpt, { includeDrafts });
    return excerpt ? [{ template, excerpt }] : [];
  });

  if (!reducedMotion && mode === 'webgl' && items.length > 0) return <FlightTemplateChapter items={items} />;

  return (
    <section data-template-chapter className="relative z-10 mx-auto max-w-6xl space-y-16 px-6 py-16 lg:px-10">
      <ChapterHeading />
      {items.map(({ template, excerpt }) => (
        <div key={template.id} data-door-b-template={template.id} className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <TemplateText template={template} />
          <div className="min-w-0 space-y-6">
            <EditorPanel excerpt={excerpt} />
            <MediaLoop {...loopOf(template)} className="rounded-lg shadow-2xl" />
          </div>
        </div>
      ))}
      <AllTemplatesLink />
    </section>
  );
}
