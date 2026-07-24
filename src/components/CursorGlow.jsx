import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorGlow() {
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const sx = useSpring(x, { stiffness: 40, damping: 20 });
  const sy = useSpring(y, { stiffness: 40, damping: 20 });

  useEffect(() => {
    function move(e) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed -z-10 h-[36rem] w-[36rem] rounded-full bg-orange-500/20 blur-[120px]"
      style={{ left: sx, top: sy, translateX: '-50%', translateY: '-50%' }}
    />
  );
}