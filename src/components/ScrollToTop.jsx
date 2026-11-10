// @ts-check
import { useLocation } from 'react-router-dom';
import { glideTo } from '../scroll/glide.js';
import { useIsomorphicLayoutEffect } from '../ssr/useHydrated.js';

/**
 * Starts every new page at the top, before the browser paints it, so a phone never shows the new
 * page at the old page's scroll position. It jumps through the scroll engine when one is running,
 * so smooth scrolling does not carry the old position onto the new page, and with
 * `behavior: 'instant'` so the stylesheet's smooth scrolling does not turn the jump into a scroll
 * a phone cuts short.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useIsomorphicLayoutEffect(() => {
    glideTo(0, { instant: true });
  }, [pathname]);
  return null;
}
