import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useRestaurant } from '../app/RestaurantContext';
import { NAV_ITEMS } from '../lib/navigation';

/**
 * The fixed header. Over the home page's photograph it starts transparent and darkens once the page
 * scrolls; on every other page it is solid from the start, so the links are always readable. On small
 * screens the links sit behind a labelled Menu button; without JavaScript they are simply shown.
 */
export function Header() {
  const restaurant = useRestaurant();
  const { pathname } = useLocation();
  const overPhoto = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuId = useId();

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const solid = !overPhoto || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,padding] duration-500 motion-reduce:transition-none ${
        solid ? 'bg-charcoal py-3 shadow-lg' : 'bg-gradient-to-b from-black/70 to-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-6">
        <Link to="/" className="flex min-h-[2.75rem] flex-col justify-center leading-none">
          <span className="font-display text-2xl italic tracking-wide text-cream md:text-3xl">{restaurant.site.name}</span>
          <span className="mt-1 hidden text-[10px] uppercase tracking-[0.35em] text-gold md:block">{restaurant.site.tagline}</span>
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="site-menu-toggle hidden min-h-[2.75rem] min-w-[2.75rem] items-center justify-center gap-2 text-cream lg:hidden"
        >
          {open ? <X size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
          <span className="text-xs uppercase tracking-[0.2em]">{open ? 'Close' : 'Menu'}</span>
        </button>

        <nav aria-label="Main" id={menuId} data-open={open} className="site-nav w-full lg:w-auto">
          <ul className="flex flex-col gap-1 py-4 lg:flex-row lg:items-center lg:gap-9 lg:py-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `inline-flex min-h-[2.75rem] items-center border-b text-sm font-medium uppercase tracking-[0.15em] transition-colors duration-300 motion-reduce:transition-none ${
                      isActive ? 'border-gold text-gold' : 'border-transparent text-cream hover:text-gold'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
