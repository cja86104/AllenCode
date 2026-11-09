import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from './Magnetic';

const LINKS = [
  { to: '/products', label: 'Products' },
  { to: '/services', label: 'Services' },
  { to: '/templates', label: 'Templates' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Site navigation. On regular routes it is sticky and takes its own space at the top of the page.
 * With `overlay` (field routes) it is fixed over the page instead, so pinned scenes start at the very
 * top and their full height is on screen when the page opens.
 */
export default function Nav({ overlay = false }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`${overlay ? 'fixed inset-x-0' : 'sticky'} top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" onClick={() => setOpen(false)} className="mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          Allen<span className="text-orange-500">Code</span> Co.
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `mono text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-orange-500' : 'text-white/70 hover:text-white'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Magnetic>
            <Link
              to="/contact"
              className="rounded-full border border-orange-500 px-5 py-2 mono text-xs uppercase tracking-widest text-orange-500 transition-colors hover:bg-orange-500 hover:text-black"
            >
              Start a Project
            </Link>
          </Magnetic>
        </nav>

        <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="text-white lg:hidden">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `mono border-b border-white/5 py-3 text-sm uppercase tracking-widest ${isActive ? 'text-orange-500' : 'text-white/80'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mono mt-3 rounded-full border border-orange-500 px-5 py-3 text-center text-xs uppercase tracking-widest text-orange-500"
              >
                Start a Project
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}