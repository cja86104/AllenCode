// @ts-check
import { useEffect, useRef } from 'react';
import { services } from '../data/services.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { fieldBus, useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING, editorSize } from '../field/editorMetrics.js';
import { SYNTAX_COLORS, tokenizeLine } from '../field/syntax.js';
import CodeLines from '../field/CodeLines.jsx';
import { auditTimeline, chapterTimeline } from './chapterTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {(typeof services)[number]} Service */
/** @typedef {import('../field/types.js').Box} Box */

/** Door A's service chapters, in story order (spec section 4, step 4). */
export const SERVICE_CHAPTERS = Object.freeze([
  { slug: 'mvp-sprints', excerptId: 'service-mvp' },
  { slug: 'custom-saas-builds', excerptId: 'service-custom' },
  { slug: 'ai-integration', excerptId: 'service-ai' },
  { slug: 'technical-audits', excerptId: 'service-audit' },
]);

const TITLE_BAR_HEIGHT = 30;
const DESKTOP_MIN_WIDTH = 1024;

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
function ServiceText({ service, compact = false }) {
  return (
    <div>
      <h2 className="font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{service.name}</h2>
      <p className="mt-5 max-w-xl text-white/65">{service.summary}</p>
      {!compact && (
        <ul className="mt-6 space-y-2 border-t border-white/10 pt-6">
          {service.scope.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/55">
              <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-ember/70" />
              {item}
            </li>
          ))}
        </ul>
      )}
      <p className="mono mt-6 text-xs uppercase tracking-[0.25em] text-ember">Timeline: {service.timeline}</p>
    </div>
  );
}

/**
 * A static editor panel with the excerpt's file name and code.
 * @param {{ excerpt: Excerpt }} props
 */
function EditorPanel({ excerpt }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
      <figcaption className="sr-only">
        {`Code from ${excerpt.file} (${excerpt.repo}), which becomes ${excerpt.becomes}.`}
      </figcaption>
      <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
        {excerpt.file}
      </div>
      <pre className="mono overflow-x-auto p-5 text-[13px] leading-[19px] [font-variant-ligatures:none]">
        <CodeLines code={excerpt.code} />
      </pre>
    </figure>
  );
}

/**
 * Where the text, the editor and the screen sit for one viewport: text on the left and the stage on
 * the right on desktop; text above the stage on phones.
 * @param {number} w
 * @param {number} h
 * @returns {{ text: Box, stage: Box }}
 */
function chapterLayout(w, h) {
  if (w >= DESKTOP_MIN_WIDTH) {
    return {
      text: { x: w * 0.06, y: h * 0.18, w: w * 0.32, h: h * 0.64 },
      stage: { x: w * 0.42, y: h * 0.14, w: w * 0.54, h: h * 0.74 },
    };
  }
  return {
    text: { x: w * 0.06, y: h * 0.1, w: w * 0.88, h: h * 0.3 },
    stage: { x: w * 0.04, y: h * 0.44, w: w * 0.92, h: h * 0.5 },
  };
}

/**
 * A box of the given aspect ratio, as large as fits, centered in `area`.
 * @param {Box} area
 * @param {number} aspect width / height
 * @returns {Box}
 */
function fit(area, aspect) {
  const w = Math.min(area.w, area.h * aspect);
  const h = w / aspect;
  return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h };
}

/**
 * Where everything in a flight chapter sits for one viewport. Pure, so the render and the
 * transformation request always agree.
 * @param {string} code
 * @param {{ width: number, height: number }} screen
 * @param {number} w
 * @param {number} h
 * @returns {{ text: Box, sourceBox: Box, codeScale: number, targetBox: Box }}
 */
export function flightGeometry(code, screen, w, h) {
  const { text, stage } = chapterLayout(w, h);
  const full = editorSize(code);
  const codeScale = Math.min(1, stage.w / full.w, (stage.h - TITLE_BAR_HEIGHT) / full.h);
  const size = editorSize(code, codeScale);
  const sourceBox = {
    x: stage.x + (stage.w - size.w) / 2,
    y: stage.y + TITLE_BAR_HEIGHT + (stage.h - TITLE_BAR_HEIGHT - size.h) / 2,
    ...size,
  };
  return { text, sourceBox, codeScale, targetBox: fit(stage, screen.width / screen.height) };
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
  const { slug } = service;
  const { code } = excerpt;
  const { src, alt, width, height } = screen;

  useEffect(() => {
    if (!visible) return undefined;
    const geometry = flightGeometry(code, { width, height }, viewport.w, viewport.h);
    const key = `${slug}:${viewport.w}x${viewport.h}`;
    fieldBus.claimTransform({
      key,
      code,
      sourceBox: geometry.sourceBox,
      codeScale: geometry.codeScale,
      target: { kind: 'image', src, alt },
      targetBox: geometry.targetBox,
      step: Math.max(5, Math.round(geometry.targetBox.w / 110)),
    });
    return () => fieldBus.releaseTransform(key);
  }, [visible, viewport.w, viewport.h, slug, code, src, alt, width, height]);

  useEffect(() => {
    if (visible) fieldBus.setTransformProgress(`${slug}:${viewport.w}x${viewport.h}`, timeline.flight);
  }, [visible, timeline.flight, slug, viewport.w, viewport.h]);

  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-chapter={slug} className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
          <ServiceText service={service} compact={viewport.w < DESKTOP_MIN_WIDTH} />
        </div>
        <div
          aria-hidden="true"
          style={{
            opacity: frameOpacity,
            left: sourceBox.x,
            top: sourceBox.y - TITLE_BAR_HEIGHT,
            width: sourceBox.w,
            height: sourceBox.h + TITLE_BAR_HEIGHT,
          }}
          className="absolute rounded-xl border border-white/10 bg-night/70"
        >
          <div
            style={{ height: TITLE_BAR_HEIGHT }}
            className="mono flex items-center border-b border-white/10 px-4 text-[11px] tracking-widest text-white/45"
          >
            {excerpt.file}
          </div>
        </div>
        <pre
          aria-hidden="true"
          style={{
            opacity: codeOpacity,
            left: sourceBox.x + EDITOR_PADDING * codeScale,
            top: sourceBox.y + EDITOR_PADDING * codeScale,
            fontSize: CODE_FONT_SIZE * codeScale,
            lineHeight: `${CODE_LINE_HEIGHT * codeScale}px`,
          }}
          className="mono absolute m-0 whitespace-pre [font-variant-ligatures:none]"
        >
          <CodeLines code={code} />
        </pre>
        <img
          src={src}
          alt={alt}
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
      className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10"
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

  const panel = excerpt && (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
      <figcaption className="sr-only">
        {`Code from ${excerpt.file} (${excerpt.repo}), which becomes ${excerpt.becomes}.`}
      </figcaption>
      <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
        {excerpt.file}
      </div>
      <pre
        style={{ fontSize, lineHeight: 1.46 }}
        className="mono overflow-x-auto py-4 [font-variant-ligatures:none]"
      >
        {lines.map((line, row) => {
          const isChecked = row < checked;
          const isCurrent = live && row === checked - 1;
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
              <span>
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

  if (!live) {
    return (
      <section
        data-chapter={service.slug}
        className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10"
      >
        <ServiceText service={service} />
        <div className="min-w-0">{panel}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-chapter={service.slug} className="relative h-[180vh]">
      <div className="pin-frame sticky top-0 flex items-center">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
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
 * @param {{ includeDrafts: boolean }} props Drafts only on the `/preview` route.
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
