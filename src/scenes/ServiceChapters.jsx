// @ts-check
import { useRef } from 'react';
import { services } from '../data/services.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { CODE_FONT_SIZE, EDITOR_PADDING } from '../field/editorMetrics.js';
import { SYNTAX_COLORS, tokenizeLine } from '../field/syntax.js';
import { auditTimeline, chapterTimeline } from './chapterTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';
import { CHAPTER_BODY, CHAPTER_GRID, CHAPTER_ITEM, CHAPTER_LABEL, CHAPTER_TITLE } from './chapterType.js';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {(typeof services)[number]} Service */

/** Door A's service chapters, in story order (spec section 4, step 4). */
export const SERVICE_CHAPTERS = Object.freeze([
  { slug: 'mvp-sprints', excerptId: 'service-mvp' },
  { slug: 'custom-saas-builds', excerptId: 'service-custom' },
  { slug: 'ai-integration', excerptId: 'service-ai' },
  { slug: 'technical-audits', excerptId: 'service-audit' },
]);

/**
 * @param {readonly number[]} color 0..1 RGB
 * @returns {string}
 */
function css(color) {
  return `rgb(${color.map((c) => Math.round(c * 255)).join(', ')})`;
}

/**
 * The service's own copy from services.js: name, summary, scope and timeline. Never a price.
 * `compact` leaves out the scope list, for a pinned chapter on a phone.
 * @param {{ service: Service, compact?: boolean }} props
 */
export function ServiceText({ service, compact = false }) {
  return (
    <div>
      <h2 className={CHAPTER_TITLE}>{service.name}</h2>
      <p className={`mt-5 max-w-xl lg:max-w-none ${CHAPTER_BODY}`}>{service.summary}</p>
      {!compact && (
        <ul className="mt-6 space-y-2 border-t border-white/10 pt-6">
          {service.scope.map((item) => (
            <li key={item} className={`flex items-start gap-3 ${CHAPTER_ITEM}`}>
              <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-ember/70" />
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className={`mt-6 tracking-[0.25em] text-ember ${CHAPTER_LABEL}`}>Timeline: {service.timeline}</p>
    </div>
  );
}

/**
 * A chapter whose code flies onto a real product screen (spec section 4, step 4).
 * @param {{ service: Service, excerpt: Excerpt, screen: { src: string, alt: string, width: number, height: number } }} props
 */
function FlightChapter({ service, excerpt, screen }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mode } = useField();
  const { progress, visible, viewport } = useSectionProgress(sectionRef, true);
  const { text, sourceBox, codeScale, targetBox } = flightGeometry(excerpt.code, screen, viewport.w, viewport.h);
  const timeline = chapterTimeline(progress);
  useImageFlight({ slug: service.slug, code: excerpt.code, screen, visible, viewport, flight: timeline.flight });

  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-chapter={service.slug} className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
          <ServiceText service={service} compact={viewport.w < DESKTOP_MIN_WIDTH} />
        </div>
        <FlightEditor
          file={excerpt.file}
          code={excerpt.code}
          sourceBox={sourceBox}
          codeScale={codeScale}
          codeOpacity={codeOpacity}
          frameOpacity={frameOpacity}
        />
        <img
          src={screen.src}
          alt={screen.alt}
          style={{ opacity: timeline.handoff, left: targetBox.x, top: targetBox.y, width: targetBox.w, height: targetBox.h }}
          className="absolute rounded-lg object-cover shadow-2xl"
        />
      </div>
    </section>
  );
}

/**
 * A chapter without a flight: the service's copy beside its code (and its screen, when one exists).
 * Used for reduced motion, without WebGL, and until Chris supplies the chapter's screen.
 * @param {{ service: Service, excerpt: Excerpt | null, screen: { src: string, alt: string } | null }} props
 */
function StaticChapter({ service, excerpt, screen }) {
  return (
    <section
      data-chapter={service.slug}
      className={`relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 ${CHAPTER_GRID} lg:items-center lg:px-10`}
    >
      <ServiceText service={service} />
      <div className="min-w-0 space-y-6">
        {excerpt && <EditorPanel excerpt={excerpt} />}
        {screen && <img src={screen.src} alt={screen.alt} className="w-full rounded-lg shadow-2xl" />}
      </div>
    </section>
  );
}

/**
 * The audit's file with its lines checked: the first `checked` lines carry an ember ✓, and line
 * `current` is the one being checked. Shared by the audit chapter and the world's audit landmark,
 * which shows it with every line checked (Code World W2.5).
 * @param {{ excerpt: Excerpt, checked: number, current?: number, fontSize: number | string }} props
 */
export function AuditPanel({ excerpt, checked, current = -1, fontSize }) {
  const lines = excerpt.code.split('\n');
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
      <figcaption className="sr-only">
        {`Code from ${excerpt.file} (${excerpt.repo}), which becomes ${excerpt.becomes}.`}
      </figcaption>
      <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/60">
        {excerpt.file}
      </div>
      <pre
        style={{ fontSize, lineHeight: 1.46 }}
        className="mono whitespace-pre-wrap py-4 [font-variant-ligatures:none] [overflow-wrap:anywhere]"
      >
        {lines.map((line, row) => {
          const isChecked = row < checked;
          const isCurrent = row === current;
          return (
            <div
              key={row}
              data-audit-line
              data-checked={isChecked ? 'true' : undefined}
              className={`flex gap-3 px-4 ${isCurrent ? 'bg-ember/10' : ''}`}
            >
              <span aria-hidden="true" className={`w-3 shrink-0 ${isChecked ? 'text-ember' : 'text-transparent'}`}>
                ✓
              </span>
              <span className="min-w-0">
                {tokenizeLine(line).map((token, i) => (
                  <span key={i} style={{ color: css(SYNTAX_COLORS[token.kind]) }}>
                    {token.text}
                  </span>
                ))}
                {line.length === 0 ? ' ' : null}
              </span>
            </div>
          );
        })}
      </pre>
    </figure>
  );
}

/**
 * The audit chapter (spec section 4, step 4): the code stays put and its lines are checked one by
 * one as the visitor scrolls. Static: the code is shown without the checking.
 * @param {{ service: Service, excerpt: Excerpt | null, animate: boolean }} props
 */
function AuditChapter({ service, excerpt, animate }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const live = animate && excerpt !== null;
  const { progress, viewport } = useSectionProgress(sectionRef, live);
  const lines = excerpt ? excerpt.code.split('\n') : [];
  const checked = live ? auditTimeline(progress, lines.length) : 0;
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const panelWidth = viewport.w >= DESKTOP_MIN_WIDTH ? viewport.w * 0.5 : viewport.w - 48;
  const fontSize = Math.min(CODE_FONT_SIZE, (panelWidth - 2 * EDITOR_PADDING - 24) / (longest * 0.6));

  const panel = excerpt && <AuditPanel excerpt={excerpt} checked={checked} current={live ? checked - 1 : -1} fontSize={fontSize} />;

  if (!live) {
    return (
      <section
        data-chapter={service.slug}
        className={`relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 ${CHAPTER_GRID} lg:items-center lg:px-10`}
      >
        <ServiceText service={service} />
        <div className="min-w-0">{panel}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-chapter={service.slug} className="relative h-[180vh]">
      <div className="pin-frame sticky top-0 flex items-center">
        <div className={`relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 ${CHAPTER_GRID} lg:items-center lg:px-10`}>
          <ServiceText service={service} />
          <div className="min-w-0">{panel}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * Door A's service chapters. Each shows the service's own copy and real code; a chapter with a
 * screen flies its code onto that screen when the renderer is running.
 * @param {{ includeDrafts: boolean }} props Whether unapproved excerpts may show (the public site passes false).
 */
export default function ServiceChapters({ includeDrafts }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const flights = !reducedMotion && mode === 'webgl';

  return (
    <>
      {SERVICE_CHAPTERS.map(({ slug, excerptId }) => {
        const service = services.find((s) => s.slug === slug);
        if (!service) throw new Error(`services.js has no service "${slug}".`);
        const excerpt = getExcerpt(excerptId, { includeDrafts });
        if (slug === 'technical-audits') {
          return <AuditChapter key={slug} service={service} excerpt={excerpt} animate={!reducedMotion} />;
        }
        const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (slug)];
        if (flights && excerpt && screen) {
          return <FlightChapter key={slug} service={service} excerpt={excerpt} screen={screen} />;
        }
        return <StaticChapter key={slug} service={service} excerpt={excerpt} screen={screen} />;
      })}
    </>
  );
}
