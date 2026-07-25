import { Link } from 'react-router-dom';
import { ArrowUpRight, Lock, ExternalLink } from 'lucide-react';
import Reveal from './Reveal';

export default function ProductCard({ product, index, slot }) {
  const isPrivate = product.status === 'private';
  const isComingSoon = product.status === 'coming-soon';

  return (
    <Reveal delay={index * 0.08}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-orange-500/50">
        {/* Image — clicking goes to the detail/showcase page */}
        <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-black">
          {product.video ? (
            <video
              src={product.video}
              autoPlay
              muted
              loop
              playsInline
              className="block w-full aspect-[4/3] object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <img
              data-aiwp-slot={slot}
              src={product.image}
              alt={`${product.name} product preview`}
              className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          )}
          {isPrivate && (
            <span className="absolute right-4 top-4 mono inline-flex items-center gap-1 rounded-full border border-orange-500/60 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-orange-500">
              <Lock size={11} /> Private
            </span>
          )}
          {isComingSoon && (
            <span className="absolute right-4 top-4 mono inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60">
              Coming soon
            </span>
          )}
        </Link>

        {/* Card body */}
        <div className="flex flex-1 flex-col p-8">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-orange-500">{product.category}</p>
          <h3 className="mt-3 font-display text-3xl tracking-tight">{product.name}</h3>
          <p className="mt-3 text-white/60">{product.tagline}</p>

          {/* Bottom action row */}
          <div className="mt-6 flex items-center gap-5">
            <Link
              to={`/products/${product.slug}`}
              className="inline-flex items-center gap-2 font-display text-sm text-white hover:text-orange-500"
            >
              View showcase{' '}
              <ArrowUpRight size={14} className="transition-transform hover:translate-x-0.5 hover:-translate-y-0.5" />
            </Link>

            {product.url && (
              <>
                <span className="text-white/20">·</span>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mono text-[11px] uppercase tracking-widest text-white/40 hover:text-orange-500"
                >
                  Live site <ExternalLink size={11} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
