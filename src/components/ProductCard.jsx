// @ts-check
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Lock } from 'lucide-react';
import Reveal from './Reveal';
import { DISPLAY, PANEL_HOVER } from './PageHeader.jsx';

/**
 * One product on the products page, as a file: its folder in the title bar, its `image` (the one
 * field that drives every product picture, docs/PRODUCT-IMAGES.md), and its status.
 *
 * @param {{ product: import('../data/catalog.js').Product, index: number }} props
 */
export default function ProductCard({ product, index }) {
  const isPrivate = product.status === 'private';
  const isComingSoon = product.status === 'coming-soon';
  const isLive = product.status === 'live';

  return (
    <Reveal delay={index * 0.08}>
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
        <Link
          to={`/products/${product.slug}`}
          viewTransition
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-black"
        >
          <img
            src={product.image}
            alt=""
            loading={index > 1 ? 'lazy' : undefined}
            className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        </Link>
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
