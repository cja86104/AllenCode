// @ts-check
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { chapterTimeline } from './chapterTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';
import { BUILDER } from '../content/builderStory.js';

export { BUILDER };

/** @param {{ compact?: boolean }} props */
function BuilderText({ compact = false }) {
  return (
    <div>
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{BUILDER.eyebrow}</p>
      <h2
        className={`mt-4 font-serif-display italic leading-tight text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}
      >
        {BUILDER.title}
      </h2>
      <p className={`max-w-xl text-white/70 ${compact ? 'mt-3 text-sm' : 'mt-6'}`}>{BUILDER.body}</p>
      <Link
        to="/about"
        className="mono mt-5 inline-flex text-xs uppercase tracking-widest text-white hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        {BUILDER.link} <span aria-hidden="true">&nbsp;→</span>
      </Link>
    </div>
  );
}

/** @param {{ className?: string }} props */
function Portrait({ className = '' }) {
  const { photo } = BUILDER;
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading="lazy"
      decoding="async"
      className={`rounded-xl border border-white/10 object-cover ${className}`}
    />
  );
}

/**
 * The builder (spec section 4, step 7, shared by both doors). Chris's story as code, the timeline
 * from the About page, lifts off `About.jsx` and lands as his portrait as the visitor scrolls; the
 * real photo then resolves through it. Without the renderer or with reduced motion the code sits
 * beside the photo.
 */
export default function Builder() {
  const excerpt = getExcerpt('builder');
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const flies = Boolean(excerpt) && !reducedMotion && mode === 'webgl';
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { progress, visible, viewport } = useSectionProgress(sectionRef, flies);
  const code = excerpt ? excerpt.code : '';
  const screen = { src: BUILDER.photo.src, alt: BUILDER.photo.alt, width: BUILDER.photo.width, height: BUILDER.photo.height };
  const timeline = chapterTimeline(progress);
  useImageFlight({ slug: 'builder', code, screen, visible: flies && visible, viewport, flight: timeline.flight });

  if (!flies || !excerpt) {
    return (
      <section
        data-chapter="builder"
        className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10"
      >
        <BuilderText />
        <div className="min-w-0 space-y-6">
          {excerpt && <EditorPanel excerpt={excerpt} />}
          <Portrait className="aspect-[4/5] h-auto w-full max-w-md" />
        </div>
      </section>
    );
  }

  const { text, sourceBox, codeScale, targetBox } = flightGeometry(code, screen, viewport.w, viewport.h);
  const codeOpacity = timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-chapter="builder" className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
          <BuilderText compact={viewport.w < DESKTOP_MIN_WIDTH} />
        </div>
        <FlightEditor
          file={excerpt.file}
          code={code}
          sourceBox={sourceBox}
          codeScale={codeScale}
          codeOpacity={codeOpacity}
          frameOpacity={frameOpacity}
        />
        <div
          style={{ opacity: timeline.handoff, left: targetBox.x, top: targetBox.y, width: targetBox.w, height: targetBox.h }}
          className="absolute"
        >
          <Portrait className="h-full w-full shadow-2xl" />
        </div>
      </div>
    </section>
  );
}
