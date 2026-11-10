// @ts-check
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Pulls its child a little toward the pointer while the pointer is over it.
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export default function Magnetic({ children, className = '' }) {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [pos, setPos] = useState({ x: 0, y: 0 });

  /** @param {import('react').MouseEvent<HTMLDivElement>} e */
  function handleMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.3, y: y * 0.3 });
  }

  function reset() {
    setPos({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.5 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}