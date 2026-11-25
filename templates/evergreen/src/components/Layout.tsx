import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Brings the requested section into view after navigation, and moves focus to it so keyboard and
 * screen-reader users arrive where they asked to go. Without a hash, a new page starts at the top.
 */
function useScrollToHash() {
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

/**
 * Opens every collapsed story and memory while printing, so a printed copy has all of it, then puts
 * them back as the reader left them.
 */
function useOpenDisclosuresForPrint() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = [...document.querySelectorAll<HTMLDetailsElement>('details:not([open])')];
      opened.forEach((details) => {
        details.open = true;
      });
    };
    const after = () => {
      opened.forEach((details) => {
        details.open = false;
      });
      opened = [];
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);
}

export function Layout() {
  useScrollToHash();
  useOpenDisclosuresForPrint();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
