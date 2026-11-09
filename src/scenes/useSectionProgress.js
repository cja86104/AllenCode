// @ts-check
import { useEffect, useState } from 'react';

/**
 * Scroll progress through a tall (pinned) section: 0 when its top reaches the top of the screen,
 * 1 when its bottom reaches the bottom; whether it is on screen; and the viewport size.
 *
 * @param {import('react').RefObject<HTMLElement | null>} ref
 * @param {boolean} enabled Static chapters do not track scroll.
 * @returns {{ progress: number, visible: boolean, viewport: { w: number, h: number } }}
 */
export function useSectionProgress(ref, enabled) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const section = ref.current;
    if (!enabled || !section) return undefined;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      setVisible(rect.top < window.innerHeight && rect.bottom > 0);
      setProgress(span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0);
    };
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      update();
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
    };
  }, [ref, enabled]);

  return { progress, visible, viewport };
}
