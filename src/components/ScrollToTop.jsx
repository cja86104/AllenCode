// @ts-check
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { glideTo } from '../scroll/glide.js';

/**
 * Starts every new page at the top. It jumps through the scroll engine when one is running, so
 * smooth scrolling does not carry the old page's position onto the new one.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    glideTo(0, { instant: true });
  }, [pathname]);
  return null;
}
