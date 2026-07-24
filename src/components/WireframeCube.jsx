import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function WireframeCube() {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [15, -15]), { stiffness: 80, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-15, 15]), { stiffness: 80, damping: 20 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  const size = 180;
  const half = size / 2;
  const faces = [
    `translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-hidden="true"
      className="relative hidden h-64 w-64 items-center justify-center md:flex [perspective:1000px]"
    >
      <motion.div style={{ rotateX, rotateY }} className="relative h-full w-full [transform-style:preserve-3d]">
        <div
          className="absolute animate-spin3d [transform-style:preserve-3d]"
          style={{ width: size, height: size, left: '50%', top: '50%', marginLeft: -half, marginTop: -half }}
        >
          {faces.map((f, i) => (
            <div
              key={i}
              className="absolute border border-orange-500/50 bg-orange-500/[0.03]"
              style={{ width: size, height: size, transform: f }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}