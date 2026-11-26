import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Anchor, Menu as MenuIcon, ShoppingBag, X } from 'lucide-react';
import { useBrewery } from '../app/BreweryContext';
import { useCart } from '../app/CartContext';
import { CAN_CLUB_PATH, NAV_ITEMS } from '../lib/navigation';

/**
 * The fixed header on a frosted navy bar. On small screens the links sit behind a labelled Menu button;
 * without JavaScript they are simply shown.
 */
export function Header() {
  const brewery = useBrewery();
  const cart = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuId = useId();

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-cream/10 bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 px-4 py-2 md:px-6">
        <Link to="/" className="group flex min-h-[2.75rem] shrink-0 items-center gap-2">
          <Anchor
            size={24}
            strokeWidth={1.75}
            aria-hidden="true"
            className="text-brass transition-transform group-hover:rotate-12 motion-reduce:transition-none"
          />
          <span className="leading-none">
            <span className="block font-display text-2xl tracking-wider text-cream">{brewery.site.shortName}</span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-brass">{brewery.site.tagline}</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 xl:order-last">
          {/* The cart needs JavaScript, so its button appears once the saved cart has been read. */}
          {cart.ready ? (
            <button
              type="button"
              onClick={cart.openDrawer}
              className="relative inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center text-cream transition-colors hover:text-brass"
            >
              <ShoppingBag size={22} aria-hidden="true" />
              <span className="sr-only">
                Cart, {cart.count} {cart.count === 1 ? 'item' : 'items'}
              </span>
              {cart.count > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 text-[11px] font-bold text-navy"
                >
                  {cart.count}
                </span>
              ) : null}
            </button>
          ) : null}
          <Link
            to={CAN_CLUB_PATH}
            className="clip-btn hidden min-h-[2.75rem] items-center bg-brass px-4 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-brass-bright sm:inline-flex"
          >
            Join the Can Club
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="site-menu-toggle hidden min-h-[2.75rem] min-w-[2.75rem] items-center justify-center gap-2 text-cream xl:hidden"
          >
            {open ? <X size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
            <span className="text-xs uppercase tracking-[0.2em]">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        <nav aria-label="Main" id={menuId} data-open={open} className="site-nav w-full xl:w-auto">
          <ul className="flex flex-col py-3 xl:flex-row xl:items-center xl:gap-6 xl:py-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="border-b border-cream/10 last:border-b-0 xl:border-b-0">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex min-h-[2.75rem] items-center border-b-2 py-2 font-display text-2xl tracking-wide transition-colors motion-reduce:transition-none xl:py-0 xl:font-sans xl:text-sm xl:uppercase ${
                      isActive ? 'border-brass text-brass' : 'border-transparent text-cream hover:text-brass'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-4 sm:hidden">
              <Link
                to={CAN_CLUB_PATH}
                className="clip-btn inline-flex min-h-[2.75rem] items-center bg-brass px-5 text-xs font-bold uppercase tracking-wider text-navy"
              >
                Join the Can Club
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
