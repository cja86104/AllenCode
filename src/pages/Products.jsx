// @ts-check
import ProductCard from '../components/ProductCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { catalog } from '../data/catalog.js';

export default function Products() {
  usePageMeta(
    'Products — Allen Code Co.',
    'Live products built and shipped by Allen Code Co.: My Teachers Toolbox, UnderFire AI, Founders Helm, and Crew Advisors.',
  );

  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          path="products"
          eyebrow="Products"
          title="Live in the market, built to survive scrutiny."
          lede="Every product here is either live and generating revenue, or deliberately kept private. Nothing shown below is a prototype."
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {catalog.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
