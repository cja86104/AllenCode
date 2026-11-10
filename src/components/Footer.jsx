// @ts-check
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, Mail } from 'lucide-react';
import { catalog } from '../data/catalog.js';
import { services } from '../data/services.js';
import { templateCategories } from '../data/templates.js';
import { useHydrated } from '../ssr/useHydrated.js';
import { BUILD_YEAR } from '../ssr/buildYear.js';

/**
 * @param {{ title: string, links: { label: string, to: string }[] }} props
 */
function FooterCol({ title, links }) {
  return (
    <div>
      <p className="mono text-xs uppercase tracking-widest text-white/50">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={`${l.to}:${l.label}`}>
            <Link to={l.to} viewTransition className="inline-flex items-center gap-1 text-sm text-white/75 hover:text-ember">
              {l.label} <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  // The build's year until the page hydrates, then the visitor's (Phase 9): no mismatch on a page
  // built in one year and opened in the next.
  const hydrated = useHydrated();
  const year = hydrated ? new Date().getFullYear() : BUILD_YEAR;
  return (
    <footer className="relative z-10 border-t border-white/10 bg-night/95">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="mono text-sm font-bold uppercase tracking-[0.2em]">
              Allen<span className="text-ember">Code</span> Co.
            </p>
            <p className="mt-4 max-w-sm text-sm text-white/65">
              A solo build-to-sell software studio. Every product shipped acquisition-ready from day one.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a href="mailto:chris@allencodeco.com" className="inline-flex w-fit items-center gap-2 text-white/75 hover:text-ember">
                <Mail size={16} aria-hidden="true" /> chris@allencodeco.com
              </a>
              <a
                href="https://cal.com/allencodeco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-white/75 hover:text-ember"
              >
                <Calendar size={16} aria-hidden="true" /> Book a call
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
          <FooterCol title="Products" links={catalog.map((p) => ({ label: p.name, to: `/products/${p.slug}` }))} />
          <FooterCol title="Services" links={services.map((s) => ({ label: s.name, to: '/services' }))} />
          <FooterCol title="Templates" links={templateCategories.map((c) => ({ label: c, to: '/templates' }))} />
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>© {year} Allen Code Co. All rights reserved.</p>
          <p className="mono uppercase tracking-widest">Designed &amp; built by Chris Allen</p>
        </div>
      </div>
    </footer>
  );
}
