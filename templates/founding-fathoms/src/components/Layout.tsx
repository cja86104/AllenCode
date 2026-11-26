import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { Header } from './Header';

/** Starts each new page at the top, or at the requested section, and moves focus there. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    target.scrollIntoView();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname, hash]);
}

export function Layout() {
  useScrollOnNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-navy text-cream">
      <a
        href="#main"
        className="fixed left-4 top-3 z-[60] -translate-y-[200%] bg-brass px-4 py-3 text-sm font-bold text-navy focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 pt-[3.75rem] focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      {/* Vercel Web Analytics: cookieless page-view counts. Its script loads from the site's own /_vercel/insights address, which exists only on Vercel. */}
      <Analytics />
    </div>
  );
}
