// @ts-check
import { useEffect, useRef, useState } from 'react';
import CodeLines from '../field/CodeLines.jsx';
import { usePrefersReducedMotion } from '../field/environment.js';

/** How far the file gets before it stops: it is still being written. */
export const UNFINISHED_AT = 0.65;
/** Characters typed per step, and the time between steps. */
const CHARS_PER_TICK = 3;
const TICK_MS = 28;

/**
 * A real, approved excerpt typing itself into its file whenever it is on screen, and stopping
 * unfinished with the cursor blinking, for a product that is not live yet. The newest lines stay in
 * view. With reduced motion it shows the file as far as it gets, without typing.
 *
 * @param {{ excerpt: import('../content/excerpts/index.js').Excerpt, className?: string }} props
 */
export default function TypingFile({ excerpt, className = '' }) {
  const reducedMotion = usePrefersReducedMotion();
  const target = Math.floor(excerpt.code.length * UNFINISHED_AT);
  const [typed, setTyped] = useState(0);
  const [inView, setInView] = useState(false);
  const frameRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.2 });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // One step at a time while it is on screen, until the file is as far as it gets.
  useEffect(() => {
    if (reducedMotion || !inView || typed >= target) return undefined;
    const timer = window.setTimeout(() => setTyped((n) => Math.min(target, n + CHARS_PER_TICK)), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, inView, typed, target]);

  const shown = reducedMotion ? target : typed;

  return (
    <div ref={frameRef} data-typing-file={excerpt.id} className={`relative overflow-hidden bg-night ${className}`}>
      <p className="sr-only">{`Code from ${excerpt.file} (${excerpt.repo}), still being written.`}</p>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-end">
        <pre className="mono m-0 whitespace-pre p-5 text-[11px] leading-[17px] [font-variant-ligatures:none] sm:text-[12px] sm:leading-[18px]">
          <CodeLines code={excerpt.code} visible={shown} />
          <span data-cursor className="gate-cursor" />
        </pre>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-night to-transparent" />
    </div>
  );
}
