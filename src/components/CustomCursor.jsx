import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    setEnabled(isFine);
    if (!isFine) return;

    document.body.classList.add('custom-cursor');

    function move(e) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function over(e) {
      if (e.target.closest && e.target.closest('a,button,[data-cursor-hover]')) setHovering(true);
    }
    function out(e) {
      if (e.target.closest && e.target.closest('a,button,[data-cursor-hover]')) setHovering(false);
    }

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        animate={{ width: hovering ? 48 : 14, height: hovering ? 48 : 14, opacity: hovering ? 0.9 : 1 }}
        transition={{ duration: 0.2 }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500"
      />
    </motion.div>
  );
}