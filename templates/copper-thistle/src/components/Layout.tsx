import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
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
    <div className="flex min-h-screen flex-col bg-cream text-charcoal">
      <a
        href="#main"
        className="fixed left-4 top-3 z-[60] -translate-y-[200%] bg-gold px-4 py-3 text-sm font-medium text-charcoal focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      {/* Vercel Web Analytics: counts page views without cookies. */}
      <Analytics />
    </div>
  );
}
