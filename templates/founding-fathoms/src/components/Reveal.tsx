import { useEffect, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after the element scrolls into view. */
  delay?: number;
  as?: 'div' | 'li';
}

/**
 * Fades content up as it scrolls into view. The content is in the page from the start: the fade is
 * prepared only once JavaScript has started (`html.js`), is skipped for reduced motion, and a stylesheet
 * failsafe shows everything after two seconds if the script never runs.
 */
export function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-revealed');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const props = { className: `reveal ${className}`, style: delay ? { transitionDelay: `${delay}s` } : undefined };
  return as === 'li' ? (
    <li ref={setNode} {...props}>
      {children}
    </li>
  ) : (
    <div ref={setNode} {...props}>
      {children}
    </div>
  );
}
