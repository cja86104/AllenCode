import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  { type: 'prompt', text: 'create-project my-saas-app' },
  { type: 'blank', text: '' },
  { type: 'label', text: '  framework  ', value: 'Next.js 15 + React 19' },
  { type: 'label', text: '  database   ', value: 'Supabase + PostgreSQL' },
  { type: 'label', text: '  billing    ', value: 'Stripe' },
  { type: 'label', text: '  AI         ', value: 'OpenRouter → DeepSeek' },
  { type: 'label', text: '  deploy     ', value: 'Vercel edge' },
  { type: 'blank', text: '' },
  { type: 'check', text: 'auth           configured' },
  { type: 'check', text: 'RLS            enforced on all tables' },
  { type: 'check', text: 'payments       live' },
  { type: 'check', text: 'AI             routed & cost-capped' },
  { type: 'check', text: 'TypeScript     0 errors' },
  { type: 'check', text: 'ready          ship it.' },
];

const DELAYS = { prompt: 0, blank: 200, label: 320, check: 400 };

export default function CodeTerminal() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= LINES.length) {
      const t = setTimeout(() => setCount(0), 3200);
      return () => clearTimeout(t);
    }
    const line = LINES[count];
    const t = setTimeout(() => setCount((c) => c + 1), DELAYS[line.type] ?? 350);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      className="hidden w-full max-w-sm lg:block"
    >
      {/* Window chrome */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="mono ml-3 text-[10px] uppercase tracking-widest text-white/25">
            allen-code-co — zsh
          </span>
        </div>

        {/* Terminal body */}
        <div className="min-h-[300px] p-5 font-mono text-[12.5px] leading-[1.9]">
          {LINES.slice(0, count).map((line, i) => {
            if (line.type === 'blank') return <div key={i} className="h-2" />;

            if (line.type === 'prompt') {
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-orange-500">$</span>
                  <span className="text-white/80">{line.text}</span>
                </div>
              );
            }

            if (line.type === 'label') {
              return (
                <div key={i} className="flex">
                  <span className="text-white/30">{line.label ?? line.text}</span>
                  <span className="text-white/65">{line.value}</span>
                </div>
              );
            }

            if (line.type === 'check') {
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  <span className="text-white/70">{line.text}</span>
                </div>
              );
            }

            return null;
          })}

          {/* Blinking cursor */}
          {count < LINES.length && (
            <span className="inline-block h-[13px] w-[7px] animate-pulse bg-orange-500/70 align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
