import { useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMemorial } from '../app/MemorialContext';
import { mainNavigation } from '../lib/navigation';

/**
 * The memorial's header: the person's name, and the four section links. On small screens the links sit
 * behind a labelled Menu button. Without JavaScript the links are simply shown, so nothing is hidden.
 */
export function SiteHeader() {
  const memorial = useMemorial();
  const items = mainNavigation(memorial);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(location.pathname + location.hash);
  const currentPath = location.pathname + location.hash;
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
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
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__name">
          {memorial.person.shortName ?? memorial.person.fullName}
        </Link>
        {items.length > 0 ? (
          <>
            <button
              type="button"
              className="site-header__toggle"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
            <nav aria-label="Main" id={menuId} className="site-nav" data-open={open}>
              <ul className="site-nav__list">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link to={{ pathname: '/', hash: `#${item.id}` }} className="site-nav__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        ) : null}
      </div>
    </header>
  );
}
