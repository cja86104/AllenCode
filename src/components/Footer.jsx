import { Link } from 'react-router-dom';
import { Mail, Calendar, ArrowUpRight } from 'lucide-react';
import { products } from '../data/products';
import { services } from '../data/services';
import { templateCategories } from '../data/templates';

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="mono text-xs uppercase tracking-widest text-white/40">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-orange-500">
              {l.label} <ArrowUpRight size={12} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="mono text-sm font-bold uppercase tracking-[0.2em]">
              Allen<span className="text-orange-500">Code</span> Co.
            </p>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              A solo build-to-sell software studio. Every product shipped acquisition-ready from day one.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <Link to="/contact" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-500">
                <Mail size={16} /> Contact
              </Link>
              <a
                href="https://cal.com/allencodeco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-orange-500"
              >
                <Calendar size={16} /> Book a call
              </a>
            </div>
          </div>
          <FooterCol title="Products" links={products.map((p) => ({ label: p.name, to: `/products/${p.slug}` }))} />
          <FooterCol title="Services" links={services.map((s) => ({ label: s.name, to: '/services' }))} />
          <FooterCol title="Templates" links={templateCategories.map((c) => ({ label: c, to: '/templates' }))} />
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Allen Code Co. All rights reserved.</p>
          <p className="mono uppercase tracking-widest">Designed &amp; built by Chris Allen</p>
        </div>
      </div>
    </footer>
  );
}