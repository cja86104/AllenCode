import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import usePageMeta from '../hooks/usePageMeta';
import { products } from '../data/products';

export default function Products() {
  usePageMeta(
    'Products — Allen Code Co.',
    'Live products built and shipped by Allen Code Co.: My Teachers Toolbox, UnderFire AI, Founders Helm, and Crew Advisors.'
  );

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Products</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Live in the market, built to survive scrutiny.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">
            Every product here is either live and generating revenue, or deliberately kept private. Nothing shown
            below is a prototype.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} slot={14 + i} />
          ))}
        </div>
      </div>
    </div>
  );
}