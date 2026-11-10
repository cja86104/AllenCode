// @ts-check
import { motion } from 'framer-motion';

/**
 * Fades and lifts its content in the first time it scrolls into view. Content on a page's first
 * screen passes `instant`: it is shown at once, because a browser does not count an element as
 * painted while it is invisible, and fading the first screen in delayed it by seconds on a phone.
 * @param {{ children: import('react').ReactNode, delay?: number, className?: string, y?: number, instant?: boolean }} props
 */
export default function Reveal({ children, delay = 0, className = '', y = 40, instant = false }) {
  if (instant) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}