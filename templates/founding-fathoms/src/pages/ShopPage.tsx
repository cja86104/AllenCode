import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { useCart } from '../app/CartContext';
import type { ProductCategory } from '../content/types';
import { PageHeading } from '../components/ui';
import { Checkout } from '../sections/shop/Checkout';
import { ProductCard } from '../sections/shop/ProductCard';

const SECTIONS: { category: ProductCategory; title: string }[] = [
  { category: 'Beer', title: 'Four-packs' },
  { category: 'Apparel', title: 'Apparel' },
  { category: 'Glassware', title: 'Glassware' },
  { category: 'Gear', title: 'Gear' },
];

/** The shop: four-packs and gear to order ahead, and the pickup checkout. */
export function ShopPage() {
  const { shop } = useBrewery();
  const cart = useCart();
  usePageTitle('Shop');
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 md:px-6 md:pt-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <PageHeading eyebrow={shop.eyebrow} title="Shop">
            <p>{shop.intro}</p>
          </PageHeading>
          <button
            type="button"
            onClick={cart.openDrawer}
            className="js-only clip-btn mb-12 inline-flex min-h-[2.75rem] w-fit items-center border-2 border-cream/60 px-5 text-xs font-bold uppercase tracking-wider text-cream hover:border-brass hover:text-brass"
          >
            View cart{cart.ready && cart.count > 0 ? ` (${cart.count})` : ''}
          </button>
        </div>
        <p className="no-js-only mb-10 border border-brass/40 p-4 text-mist">
          Ordering ahead needs JavaScript turned on. Everything here is also sold at the taproom bar.
        </p>

        <div className="space-y-14">
          {SECTIONS.map(({ category, title }, index) => {
            const products = shop.products.filter((product) => product.category === category);
            if (products.length === 0) return null;
            return (
              <section key={category} aria-labelledby={`shop-${index}`}>
                <h2 id={`shop-${index}`} className="mb-6 border-b border-brass/40 pb-2 font-display text-4xl tracking-wide">
                  {title}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
      <div className="js-only">
        <Checkout />
      </div>
    </>
  );
}
