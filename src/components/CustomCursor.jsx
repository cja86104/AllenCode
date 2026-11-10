// @ts-check
import { useEffect, useRef, useState } from 'react';

/** Dot size at rest, and the ring it becomes over something clickable, in CSS pixels. */
export const CURSOR_DOT = 8;
export const CURSOR_RING = 22;

/**
 * The orange cursor (Chris, 2026-11-09: keep it, "smaller, more precise"). A small dot drawn exactly
 * at the pointer, with no lag; over a link or button it becomes a thin ring around the pointer
 * instead of swelling over what is under it. Only on devices with a precise pointer; text fields
 * keep the normal cursor.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dotRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    const fine = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
    if (!fine) return undefined;
    const frame = requestAnimationFrame(() => setEnabled(true));
    document.body.classList.add('custom-cursor');

    /** @param {MouseEvent} event */
    const move = (event) => {
      const dot = dotRef.current;
      if (dot) dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    /** @param {Event} event */
    const clickable = (event) =>
      event.target instanceof Element && Boolean(event.target.closest('a,button,[data-cursor-hover]'));
    /** @param {Event} event */
    const over = (event) => {
      if (clickable(event)) setHovering(true);
    };
    /** @param {Event} event */
    const out = (event) => {
      if (clickable(event)) setHovering(false);
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  if (!enabled) return null;

  const size = hovering ? CURSOR_RING : CURSOR_DOT;
  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-cursor-dot
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      className="pointer-events-none fixed left-0 top-0 z-[100]"
    >
      <div
        style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
        className={`rounded-full transition-[width,height,margin,background-color,border-color] duration-150 ${
          hovering ? 'border-[1.5px] border-ember bg-transparent' : 'bg-ember'
        }`}
      />
    </div>
  );
}
