// @ts-check
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Lock } from 'lucide-react';
import Reveal from './Reveal';
import MediaLoop from './MediaLoop.jsx';
import TypingFile from './TypingFile.jsx';
import { DISPLAY, PANEL_HOVER } from './PageHeader.jsx';
import crewAdvisorsExcerpt from '../content/excerpts/product-crew-advisors.js';

/**
 * Products still being built show their real code typing itself, unfinished. Only an excerpt Chris
 * approved is shown; without one the card falls back to the product's image.
 * @type {Readonly<Record<string, import('../content/excerpts/index.js').Excerpt>>}
 */
const UNFINISHED_FILES = Object.freeze({ 'crew-advisors': crewAdvisorsExcerpt });

/**
 * What the card shows, in motion like the rest of the site (Chris, 2026-11-09: "not that boring
 * stale photo"): a live product's real screens, playing by themselves whenever the card is on
 * screen; a product still being built, its code typing itself; otherwise its `image`.
 * @param {{ product: import('../data/catalog.js').Product, index: number }} props
 */
function CardMedia({ product, index }) {
  const frame = 'aspect-[16/10] border-b border-white/10 bg-black';
  if (product.previewVideo && product.poster) {
    return (
      <MediaLoop
        src={product.previewVideo}
        poster={product.poster}
        alt={`${product.name}: its real screens`}
        className={frame}
      />
    );
  }
  const unfinished = product.status === 'coming-soon' ? UNFINISHED_FILES[product.slug] : undefined;
  if (unfinished && unfinished.approved) return <TypingFile excerpt={unfinished} className={frame} />;
  return (
    <div className={`overflow-hidden ${frame}`}>
      <img
        src={product.image}
        alt=""
        loading={index > 1 ? 'lazy' : undefined}
        className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
      />
    </div>
  );
}

/**
 * One product on the products page, as a file: its folder and status in the title bar, its screens
 * or code in motion, and the way to its showcase.
 *
 * @param {{ product: import('../data/catalog.js').Product, index: number }} props
 */
export default function ProductCard({ product, index }) {
  const isPrivate = product.status === 'private';
  const isComingSoon = product.status === 'coming-soon';
  const isLive = product.status === 'live';

  return (
    <Reveal delay={index * 0.08} instant={index < 2}>
      <article data-product-card={product.slug} className={`group flex h-full flex-col overflow-hidden ${PANEL_HOVER}`}>
        <div className="mono flex items-center justify-between border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
          <span>{product.slug}/</span>
          {isLive && (
            <span className="inline-flex items-center gap-2 uppercase text-ember">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" /> Live
            </span>
          )}
          {isComingSoon && <span className="uppercase text-white/50">Coming soon</span>}
          {isPrivate && (
            <span className="inline-flex items-center gap-1 uppercase text-ember">
              <Lock size={11} aria-hidden="true" /> Private
            </span>
          )}
        </div>
        <CardMedia product={product} index={index} />
        <div className="flex flex-1 flex-col p-7">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ember">{product.category}</p>
          <h2 className={`${DISPLAY} mt-3 text-3xl sm:text-4xl`}>{product.name}</h2>
          <p className="mt-3 text-white/65">{product.tagline}</p>
          <div className="mt-auto flex flex-wrap items-center gap-5 pt-6">
            <Link
              to={`/products/${product.slug}`}
              viewTransition
              className="mono inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:text-ember"
            >
              Open the showcase <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/50 hover:text-ember"
              >
                Live site <ExternalLink size={11} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
