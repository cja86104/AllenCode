// @ts-check
import { useRef } from 'react';
import { products } from '../data/products.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { useField } from '../field/fieldBus.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import MediaLoop from '../components/MediaLoop.jsx';
import { chapterTimeline } from './chapterTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, FlightEditor, flightGeometry, useImageFlight } from './flight.jsx';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {(typeof products)[number]} Product */

/** Each product's file, named for the product (spec section 4, step 5). */
export const PRODUCT_EXCERPTS = Object.freeze(
  /** @type {Record<string, string>} */ ({
    'my-teachers-toolbox': 'product-my-teachers-toolbox',
    'underfire-ai': 'product-underfire-ai',
    'founders-helm': 'product-founders-helm',
    'crew-advisors': 'product-crew-advisors',
  }),
);

/** How many of a product's stats count in beside it. */
export const COUNTERS_SHOWN = 4;

/** The loops are 1280 x 800. */
const LOOP_SIZE = { width: 1280, height: 800 };

/** Share of the chapter over which the counters count up, while the code is in flight. */
const COUNT_UNTIL = 0.55;

/** A coming-soon file is typed from this share of its characters up to TYPED_TO, and never finished. */
const TYPED_FROM = 0.15;
const TYPED_TO = 0.65;

const clamp01 = (/** @type {number} */ x) => Math.min(1, Math.max(0, x));

/**
 * A stat part of the way through counting up: its leading number scaled by `t`, with the rest of
 * the text kept. At `t` = 1 it is exactly the original text. A value that does not begin with a
 * number (a range such as `K–5`) is not a quantity and is always shown as it is.
 * @param {string} value for example `78K+`, `100%`, `105`
 * @param {number} t 0..1
 * @returns {string}
 */
export function countText(value, t) {
  const match = /^(\d+)(.*)$/.exec(value);
  if (!match || t >= 1) return value;
  const [, digits, after] = match;
  return `${Math.round(Number(digits) * clamp01(t))}${after}`;
}

/**
 * Live status: a dot and a link to the real site, or "Coming soon" for a product that is not live.
 * @param {{ product: Product }} props
 */
function Status({ product }) {
  if (product.status !== 'live' || !product.url) {
    return <p className="mono mt-5 text-[11px] uppercase tracking-[0.25em] text-white/50">Coming soon</p>;
  }
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/70">
        <span data-live-dot aria-hidden="true" className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
        </span>
        Live
      </span>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mono text-[11px] uppercase tracking-[0.25em] text-ember underline-offset-4 hover:underline focus-visible:underline"
      >
        Open live site<span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}

/**
 * The product's own copy and its real numbers from products.js, counting up to their values.
 * `compact` leaves out the tagline, for a pinned chapter on a phone.
 * @param {{ product: Product, countT: number, compact?: boolean }} props
 */
function ProductText({ product, countT, compact = false }) {
  const stats = (product.stats ?? []).slice(0, COUNTERS_SHOWN);
  return (
    <div>
      <h2 className="font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{product.name}</h2>
      {!compact && <p className="mt-4 max-w-xl text-white/65">{product.tagline}</p>}
      <Status product={product} />
      {stats.length > 0 && (
        <ul className={`mt-6 grid border-t border-white/10 pt-5 ${compact ? 'grid-cols-4 gap-3' : 'grid-cols-2 gap-x-8 gap-y-5'}`}>
          {stats.map((stat) => (
            <li key={stat.label}>
              <span className={`block font-serif-display leading-none text-white ${compact ? 'text-2xl' : 'text-4xl'}`}>
                <span data-counter aria-hidden="true">
                  {countText(stat.number, countT)}
                </span>
                <span className="sr-only">{stat.number}</span>
              </span>
              <span className="mono mt-2 block text-[10px] uppercase tracking-[0.2em] text-white/45">{stat.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** @param {Product} product */
function loopOf(product) {
  if (!product.previewVideo || !product.poster) return null;
  return {
    src: product.previewVideo,
    poster: product.poster,
    alt: `${product.name}, scrolling through its home page`,
  };
}

/**
 * A live product whose code flies onto its loop's poster, after which the loop plays.
 * @param {{ product: Product, excerpt: Excerpt, loop: { src: string, poster: string, alt: string } }} props
 */
function FlightProductChapter({ product, excerpt, loop }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mode } = useField();
  const { progress, visible, viewport } = useSectionProgress(sectionRef, true);
  const screen = { src: loop.poster, alt: loop.alt, ...LOOP_SIZE };
  const { text, sourceBox, codeScale, targetBox } = flightGeometry(excerpt.code, screen, viewport.w, viewport.h);
  const timeline = chapterTimeline(progress);
  useImageFlight({ slug: product.slug, code: excerpt.code, screen, visible, viewport, flight: timeline.flight });

  const codeOpacity = mode === 'webgl' && timeline.flight > 0 ? 0 : 1;
  const frameOpacity = 1 - Math.min(1, timeline.flight * 4);

  return (
    <section ref={sectionRef} data-product={product.slug} className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div style={{ left: text.x, top: text.y, width: text.w }} className="absolute">
          <ProductText product={product} countT={progress / COUNT_UNTIL} compact={viewport.w < DESKTOP_MIN_WIDTH} />
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
 * A product's copy beside its code and its loop. Used without the renderer and with reduced motion.
 * @param {{ product: Product, excerpt: Excerpt | null, loop: { src: string, poster: string, alt: string } | null }} props
 */
function StaticProductChapter({ product, excerpt, loop }) {
  return (
    <section
      data-product={product.slug}
      className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10"
    >
      <ProductText product={product} countT={1} />
      <div className="min-w-0 space-y-6">
        {excerpt && <EditorPanel excerpt={excerpt} />}
        {loop && <MediaLoop {...loop} className="rounded-lg shadow-2xl" />}
      </div>
    </section>
  );
}

/**
 * A product that is not live yet: its file is still being written, the cursor blinking, and it never
 * finishes. Pinned while it types; with reduced motion it stands still part-way through.
 * @param {{ product: Product, excerpt: Excerpt | null, animate: boolean }} props
 */
function ComingSoonChapter({ product, excerpt, animate }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { progress } = useSectionProgress(sectionRef, animate);
  const typed = TYPED_FROM + (TYPED_TO - TYPED_FROM) * (animate ? clamp01((progress - 0.1) / 0.8) : 1);
  const body = (
    <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
      <ProductText product={product} countT={1} />
      <div className="min-w-0">
        {excerpt && <EditorPanel excerpt={excerpt} visible={Math.round(excerpt.code.length * typed)} cursor />}
      </div>
    </div>
  );

  if (!animate) {
    return (
      <section data-product={product.slug} className="relative py-16">
        {body}
      </section>
    );
  }
  return (
    <section ref={sectionRef} data-product={product.slug} className="relative h-[160vh]">
      <div className="pin-frame sticky top-0 flex items-center">{body}</div>
    </section>
  );
}

/**
 * Door A's product chapters, one per product in products.js (spec section 4, step 5).
 * @param {{ includeDrafts: boolean }} props Drafts only on the `/preview` route.
 */
export default function ProductChapters({ includeDrafts }) {
  const reducedMotion = usePrefersReducedMotion();
  const { mode } = useField();
  const flights = !reducedMotion && mode === 'webgl';

  return (
    <>
      {products.map((product) => {
        const excerptId = PRODUCT_EXCERPTS[product.slug];
        const excerpt = excerptId ? getExcerpt(excerptId, { includeDrafts }) : null;
        if (product.status !== 'live') {
          return <ComingSoonChapter key={product.slug} product={product} excerpt={excerpt} animate={!reducedMotion} />;
        }
        const loop = loopOf(product);
        if (flights && excerpt && loop) {
          return <FlightProductChapter key={product.slug} product={product} excerpt={excerpt} loop={loop} />;
        }
        return <StaticProductChapter key={product.slug} product={product} excerpt={excerpt} loop={loop} />;
      })}
    </>
  );
}
