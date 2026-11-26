import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Trash2, X } from 'lucide-react';
import { useBrewery } from '../app/BreweryContext';
import { useCart } from '../app/CartContext';
import { money } from '../lib/cart';
import { QuantityStepper } from './QuantityStepper';

/**
 * The cart, in a modal panel from the right. A native `<dialog>` keeps focus inside while it's open, closes
 * on Escape, and returns focus to the button that opened it.
 */
export function CartDrawer() {
  const { shop } = useBrewery();
  const cart = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { drawerOpen, closeDrawer } = cart;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  // A click on the dimmed backdrop lands on the dialog itself, outside its panel; Escape and Close do the same from the keyboard.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) closeDrawer();
    };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, [closeDrawer]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-title"
      onClose={closeDrawer}
      className="cart-drawer m-0 ml-auto h-full max-h-none w-full max-w-md border-l border-cream/10 bg-panel p-0 text-cream shadow-2xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-cream/10 px-5 py-3">
          <h2 id="cart-title" className="font-display text-3xl tracking-wide">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center gap-2 text-cream hover:text-brass"
          >
            <X size={22} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.2em]">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.lines.length === 0 ? (
            <p className="leading-relaxed text-mist">
              Your cart is empty.{' '}
              <Link to="/shop" onClick={closeDrawer} className="text-brass underline underline-offset-4">
                Browse the shop
              </Link>{' '}
              for four-packs and gear.
            </p>
          ) : (
            <ul className="space-y-3">
              {cart.lines.map(({ product, quantity, total }) => (
                <li key={product.id} className="border border-cream/10 bg-navy p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-mist">
                        {product.pack ? `${product.pack} · ` : ''}
                        {money(product.price)} each
                      </p>
                    </div>
                    <p className="font-display text-xl text-brass">{money(total)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper name={product.name} quantity={quantity} onChange={(next) => cart.setQuantity(product.id, next)} />
                    <button
                      type="button"
                      onClick={() => cart.remove(product.id)}
                      className="inline-flex min-h-[2.75rem] items-center gap-2 px-2 text-sm text-mist hover:text-brass"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Remove<span className="sr-only"> {product.name}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-cream/10 px-5 py-5">
          <p className="flex justify-between font-display text-2xl tracking-wide">
            <span>Subtotal</span>
            <span className="text-brass">{money(cart.total)}</span>
          </p>
          <p className="text-sm text-mist">{shop.paymentNote}</p>
          {cart.lines.length > 0 ? (
            <Link
              to="/shop#checkout"
              onClick={closeDrawer}
              className="clip-btn flex min-h-[2.75rem] w-full items-center justify-center bg-brass py-3 text-sm font-bold uppercase tracking-wider text-navy transition-colors hover:bg-brass-bright"
            >
              Check out for pickup
            </Link>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
