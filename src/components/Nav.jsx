// @ts-check
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from './Magnetic';
import { useDoor } from '../door/DoorProvider.jsx';

const LINKS = Object.freeze([
  { to: '/products', label: 'Products' },
  { to: '/services', label: 'Services' },
  { to: '/templates', label: 'Templates' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]);

/** @type {ReadonlyArray<{ door: import('../door/doorStorage.js').Door, label: string }>} */
const DOOR_OPTIONS = Object.freeze([
  { door: 'a', label: 'Business' },
  { door: 'b', label: 'Family' },
]);

/**
 * The primary action follows the door (spec section 4, "Always present"): templates for door B,
 * a project for door A and before a door is chosen.
 * @param {import('../door/doorStorage.js').Door | null} door
 * @returns {{ to: string, label: string }}
 */
export function primaryAction(door) {
  return door === 'b' ? { to: '/templates', label: 'Browse templates' } : { to: '/contact', label: 'Start a Project' };
}

/**
 * Lets the visitor change the door they chose at the fork.
 * @param {{ className?: string }} props
 */
function DoorSwitcher({ className = '' }) {
  const { door, setDoor } = useDoor();
  return (
    <div role="group" aria-label="Show the site for" className={`flex rounded-full border border-white/15 p-0.5 ${className}`}>
      {DOOR_OPTIONS.map((option) => (
        <button
          key={option.door}
          type="button"
          aria-pressed={door === option.door}
          onClick={() => setDoor(option.door)}
          className={`mono rounded-full px-3 py-1 text-[10px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
            door === option.door ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Site navigation. On regular routes it is sticky and takes its own space at the top of the page.
 * With `overlay` (field routes) it is fixed over the page instead, so pinned scenes start at the very
 * top and their full height is on screen when the page opens.
 *
 * @param {{ overlay?: boolean }} props
 */
export default function Nav({ overlay = false }) {
  const [open, setOpen] = useState(false);
  const { door } = useDoor();
  const action = primaryAction(door);

  return (
    <header
      className={`${overlay ? 'fixed inset-x-0' : 'sticky'} top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" viewTransition onClick={() => setOpen(false)} className="mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          Allen<span className="text-orange-500">Code</span> Co.
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              viewTransition
              className={({ isActive }) =>
                `mono text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-orange-500' : 'text-white/70 hover:text-white'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <DoorSwitcher />
          <Magnetic>
            <Link
              to={action.to}
              viewTransition
              data-primary-action
              className="rounded-full border border-orange-500 px-5 py-2 mono text-xs uppercase tracking-widest text-orange-500 transition-colors hover:bg-orange-500 hover:text-black"
            >
              {action.label}
            </Link>
          </Magnetic>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="text-white lg:hidden"
        >
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
              viewTransition
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `mono border-b border-white/5 py-3 text-sm uppercase tracking-widest ${isActive ? 'text-orange-500' : 'text-white/80'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <DoorSwitcher className="mt-3 w-fit" />
              <Link
                to={action.to}
                viewTransition
                onClick={() => setOpen(false)}
                className="mono mt-3 rounded-full border border-orange-500 px-5 py-3 text-center text-xs uppercase tracking-widest text-orange-500"
              >
                {action.label}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
