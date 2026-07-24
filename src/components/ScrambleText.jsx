import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';

export default function ScrambleText({ text, className = '', as: Tag = 'span', trigger = 'view' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(text);
  const runningRef = useRef(false);

  function scramble() {
    if (runningRef.current) return;
    runningRef.current = true;
    let iteration = 0;
    const totalIterations = text.length * 3;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((ch, idx) => {
            if (ch === ' ') return ' ';
            if (idx < iteration / 3) return text[idx];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      iteration++;
      if (iteration > totalIterations) {
        clearInterval(interval);
        setDisplay(text);
        runningRef.current = false;
      }
    }, 30);
  }

  useEffect(() => {
    if (trigger === 'view' && inView) scramble();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <Tag ref={ref} className={className} onMouseEnter={trigger === 'hover' ? scramble : undefined}>
      {display}
    </Tag>
  );
}