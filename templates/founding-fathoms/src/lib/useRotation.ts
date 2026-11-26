import { useEffect, useState, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const list = window.matchMedia(QUERY);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

/** Whether the visitor asks for reduced motion, kept live as the setting changes. Off on the server. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches,
    () => false,
  );
}

/**
 * Rotates through `count` items every `intervalMs`, the way the regulars’ quotes on the home page do.
 * Rotation pauses while the visitor hovers or focuses the carousel, stops for good once they press
 * Pause or pick an item, and never starts for visitors who prefer reduced motion (WCAG 2.2.2).
 */
export function useRotation(count: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const reduced = usePrefersReducedMotion();

  const running = playing && !held && !reduced && count > 1;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => window.clearInterval(timer);
  }, [running, count, intervalMs]);

  return {
    index,
    running,
    /** Whether the Pause/Play control applies (rotation is possible at all). */
    canRotate: !reduced && count > 1,
    playing,
    select(next: number) {
      setIndex(next);
      setPlaying(false);
    },
    toggle() {
      setPlaying((value) => !value);
    },
    hold: {
      onMouseEnter: () => setHeld(true),
      onMouseLeave: () => setHeld(false),
      onFocus: () => setHeld(true),
      onBlur: () => setHeld(false),
    },
  };
}
