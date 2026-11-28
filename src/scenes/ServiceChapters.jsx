// @ts-check
import { useRef } from 'react';
import { services } from '../data/services.js';
import { serviceScreens } from '../data/serviceScreens.js';
import MediaLoop from '../components/MediaLoop.jsx';
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
/** @typedef {import('../data/services.js').Service} Service */
/** @typedef {{ src: string, alt: string, width: number, height: number, video?: string }} Screen */

/**
 * Door A's service chapters, in story order (spec section 4, step 4). The two flagships lead
 * (Chris, 2026-11-27); each shows once its excerpt is approved and its screen exists.
 */
export const SERVICE_CHAPTERS = Object.freeze([
  { slug: 'immersive-web-experiences', excerptId: 'service-immersive' },
  { slug: 'intelligent-ai-systems', excerptId: 'service-ai-systems' },
  { slug: 'mvp-sprints', excerptId: 'service-mvp' },
  { slug: 'custom-saas-builds', excerptId: 'service-custom' },
  { slug: 'custom-web-development', excerptId: 'service-web' },
  { slug: 'ui-ux-design', excerptId: 'service-uiux' },
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
 * The scope list; a scope longer than four items sets in two columns on desktop, every item kept, a
 * little closer to the summary above it (2026-11-27: seven items at 1024 × 768 need the room).
 */
const SCOPE_LIST = 'mt-6 space-y-2 border-t border-white/10 pt-6';
const SCOPE_COLUMNS = 'lg:mt-4 lg:pt-4 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-2 lg:space-y-0';

/**
 * A pinned chapter's words that are taller than the room below their place (a long scope on a short
 * desktop screen, 2026-11-27) rise until they end inside the frame, never above the navigation's band;
 * words that fit stay where they are. Shares of the frame's height.
 */
const WORDS_TOP_LIMIT = 0.1;
const WORDS_BOTTOM_LIMIT = 0.99;
/**
 * The highest the words may rise, in px from the frame's top, whatever its height: the fixed
 * navigation's bottom. Measured in Chromium (final review, 2026-11-27), the bar is 67 px tall from
 * 640 px to 1279 px wide (its 36 px action pill and 32 px of padding, and the 1 px border) and 62 px
 * from 1280 px (the full bar); 72 px clears both with room to spare, so a risen title never tucks
 * under it. A tenth of the frame alone was 60 px at 600 px tall. `e2e/chaptertext.spec.js` checks it.
 */
export const NAV_FLOOR_PX = 72;

/**
 * The words' rise, as a CSS translate: none while they fit, else up by what overflows, no further
 * than the top limit (a tenth of the frame, and never under the navigation). Percentages in a
 * translate are of the words' own height, so it needs no measuring.
 * @param {{ y: number }} text The words' place @param {number} h The frame's height
 * @returns {string}
 */
export function wordsRise(text, h) {
  const highest = Math.min(0, Math.max(NAV_FLOOR_PX, WORDS_TOP_LIMIT * h) - text.y).toFixed(1);
  const room = (WORDS_BOTTOM_LIMIT * h - text.y).toFixed(1);
  return `translateY(clamp(${highest}px, calc(${room}px - 100%), 0px))`;
}

/**
 * The shortest pinned frame, in px, that holds a scope of more than four items (two columns of up to
 * four rows) in full, by the frame's width. The words' column is 36 % of the width, so a narrower
 * screen wraps more: measured at its tallest (Immersive Web Experiences' seven items, final review
 * 2026-11-27, from the navigation's floor to 99 % of the frame), the words need 765 px of frame at
 * 1024 px wide, 689 px at 1152 px and at most 664 px from 1280 px.
 */
const LONG_SCOPE_MIN_HEIGHT = Object.freeze([
  { fromWidth: 1152, height: 700 },
  { fromWidth: DESKTOP_MIN_WIDTH, height: 768 },
]);

/**
 * Whether a pinned chapter shows its words in the compact form (tagline, summary and terms, no scope
 * list; the full list stays on /services): on phones, as before, and on a desktop frame too short for
 * a scope of more than four items. A scope of four or fewer always shows in full on desktop.
 * @param {number} scopeItems @param {number} w The frame's width @param {number} h Its height
 * @returns {boolean}
 */
export function wordsCompact(scopeItems, w, h) {
  if (w < DESKTOP_MIN_WIDTH) return true;
  if (scopeItems <= 4) return false;
  const band = LONG_SCOPE_MIN_HEIGHT.find(({ fromWidth }) => w >= fromWidth);
  return band ? h < band.height : true;
}

/**
 * Whether a service's chapter shows: it needs its excerpt and, outside the audit (which checks its
 * own file), the screen its code lands on.
 * @param {string} slug
 * @param {Excerpt | null} excerpt
 * @param {Screen | null | undefined} screen
 * @returns {boolean}
 */
export function chapterShows(slug, excerpt, screen) {
  if (!excerpt) return false;
  return slug === 'technical-audits' || Boolean(screen);
}

/**
 * The service's own copy from services.js: name, summary, scope and timeline. Never a price.
 * `compact` leaves out the scope list, for a pinned chapter on a phone or a short desktop frame
 * (`wordsCompact`).
 * @param {{ service: Service, compact?: boolean }} props
 */
export function ServiceText({ service, compact = false }) {
  return (
    <div>
      <h2 className={CHAPTER_TITLE}>{service.name}</h2>
      {service.tagline && <p className={`mt-4 tracking-[0.25em] text-ember ${CHAPTER_LABEL}`}>{service.tagline}</p>}
      <p className={`mt-5 max-w-xl lg:max-w-none ${CHAPTER_BODY}`}>{service.summary}</p>
      {!compact && (
        <ul className={service.scope.length > 4 ? `${SCOPE_LIST} ${SCOPE_COLUMNS}` : SCOPE_LIST}>
          {service.scope.map((item) => (
            <li key={item} className={`flex items-start gap-3 ${CHAPTER_ITEM}`}>
              <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-ember/70" />
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className={`mt-6 tracking-[0.25em] text-ember ${CHAPTER_LABEL}`}>{service.terms ?? `Timeline: ${service.timeline}`}</p>
    </div>
  );
}

/**
 * A chapter whose code flies onto a real product screen (spec section 4, step 4).
 * @param {{ service: Service, excerpt: Excerpt, screen: Screen }} props
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
        <div data-world-words style={{ left: text.x, top: text.y, width: text.w, transform: wordsRise(text, viewport.h) }} className="absolute">
          <ServiceText service={service} compact={wordsCompact(service.scope.length, viewport.w, viewport.h)} />
        </div>
        <FlightEditor
          file={excerpt.file}
          code={excerpt.code}
          sourceBox={sourceBox}
          codeScale={codeScale}
          codeOpacity={codeOpacity}
          frameOpacity={frameOpacity}
        />
        {screen.video ? (
          // A screen that loops a video (2026-11-16): the code lands on its poster, then the loop plays.
          <div
            data-world-target
            style={{ opacity: timeline.handoff, left: targetBox.x, top: targetBox.y, width: targetBox.w, height: targetBox.h }}
            className="absolute"
          >
            <MediaLoop src={screen.video} poster={screen.src} alt={screen.alt} active={timeline.handoff >= 1} className="h-full w-full rounded-lg shadow-2xl" />
          </div>
        ) : (
          <img
            data-world-target
            src={screen.src}
            alt={screen.alt}
            style={{ opacity: timeline.handoff, left: targetBox.x, top: targetBox.y, width: targetBox.w, height: targetBox.h }}
            className="absolute rounded-lg object-cover shadow-2xl"
          />
        )}
      </div>
    </section>
  );
}

/**
 * A chapter without a flight: the service's copy beside its code and its screen.
 * Used for reduced motion and without WebGL.
 * @param {{ service: Service, excerpt: Excerpt, screen: Screen }} props
 */
function StaticChapter({ service, excerpt, screen }) {
  return (
    <section
      data-chapter={service.slug}
      className={`relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 ${CHAPTER_GRID} lg:items-center lg:px-10`}
    >
      <ServiceText service={service} />
      <div className="min-w-0 space-y-6">
        <EditorPanel excerpt={excerpt} />
        {screen.video ? (
          <MediaLoop src={screen.video} poster={screen.src} alt={screen.alt} className="rounded-lg shadow-2xl" />
        ) : (
          <img src={screen.src} alt={screen.alt} className="w-full rounded-lg shadow-2xl" />
        )}
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
          <div data-world-target className="min-w-0">
            {panel}
          </div>
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
  return (
    <>
      {SERVICE_CHAPTERS.map(({ slug, excerptId }) => (
        <ServiceChapterFor key={slug} slug={slug} excerptId={excerptId} includeDrafts={includeDrafts} />
      ))}
    </>
  );
}

/**
 * One service's chapter, as door A shows it: the audit checking its file, a flight onto its screen, or
 * its code beside it. The Code World's business road places each on its own (W2 revised, R4).
 * A chapter without its approved excerpt, or (outside the audit) without its screen, shows nothing.
 * @param {{ slug: string, excerptId: string, includeDrafts: boolean, screens?: Readonly<Record<string, Screen | null>>, registry?: Readonly<Record<string, Excerpt>> }} props
 * `screens` is the screen lookup, serviceScreens.js unless a test passes its own; `registry` the
 * excerpts, the site's approved registry unless a test passes its own (a draft is not in it).
 */
export function ServiceChapterFor({ slug, excerptId, includeDrafts, screens = serviceScreens, registry }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const flights = !reducedMotion && mode === 'webgl';
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`services.js has no service "${slug}".`);
  const excerpt = getExcerpt(excerptId, registry ? { includeDrafts, registry } : { includeDrafts });
  if (slug === 'technical-audits') return <AuditChapter service={service} excerpt={excerpt} animate={!reducedMotion} />;
  const screen = Object.hasOwn(screens, slug) ? screens[slug] : null;
  // chapterShows decides; the two null checks only narrow the types for the chapters below.
  if (!chapterShows(slug, excerpt, screen) || !excerpt || !screen) return null;
  if (flights) return <FlightChapter service={service} excerpt={excerpt} screen={screen} />;
  return <StaticChapter service={service} excerpt={excerpt} screen={screen} />;
}
