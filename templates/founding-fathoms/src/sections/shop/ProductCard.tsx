import { Check } from 'lucide-react';
import { useCart } from '../../app/CartContext';
import type { Product } from '../../content/types';
import { MAX_QUANTITY } from '../../lib/cart';
import { price } from '../../lib/content';

/** A product with its price and an Add to cart button that confirms, in words, how many are now in the cart. */
export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const inCart = cart.lines.find((line) => line.product.id === product.id)?.quantity ?? 0;
  const full = inCart >= MAX_QUANTITY;
  return (
    <li className="flex flex-col border border-cream/15 bg-panel p-5">
      <p className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-brass">
        <span>{product.category}</span>
        {product.limited ? <span className="bg-cream px-2 py-0.5 font-bold text-navy">Limited</span> : null}
      </p>
      <h3 className="font-display text-2xl tracking-wide text-cream">{product.name}</h3>
      {product.pack ? <p className="text-sm text-mist">{product.pack}</p> : null}
      <p className="mt-2 flex-1 text-sm text-mist">{product.description}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="font-display text-3xl text-brass">{price(product.price)}</p>
        <button
          type="button"
          onClick={() => cart.add(product.id)}
          aria-label={`Add to cart: ${product.name}`}
          disabled={full}
          className="js-only clip-btn min-h-[2.75rem] bg-brass px-4 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-brass-bright disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm text-mist">
        {inCart > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Check size={14} aria-hidden="true" className="text-brass" />
            {full ? `${inCart} in your cart, the most for one order` : `${inCart} in your cart`}
          </span>
        ) : null}
      </p>
    </li>
  );
}
