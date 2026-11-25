import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

/** The small spaced capitals above a heading. `ground` picks a brass that stays readable on it. */
export function Eyebrow({
  children,
  ground = 'dark',
  className = '',
}: {
  children: ReactNode;
  ground?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <p
      className={`mb-2 text-xs font-semibold uppercase tracking-[0.3em] ${ground === 'light' ? 'text-brass-ink' : 'text-brass'} ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * The clipped-corner button styles. `brass` is the main call to action, `outline` sits beside it on a
 * photograph, `brassOutline` is the quieter action on a dark panel and `navy` is the action on cream.
 */
const VARIANTS = {
  brass: 'bg-brass text-navy hover:bg-brass-bright',
  outline: 'border-2 border-cream/60 text-cream hover:border-brass hover:text-brass',
  brassOutline: 'border-2 border-brass text-brass hover:bg-brass hover:text-navy',
  navy: 'bg-navy text-cream hover:bg-panel',
} as const;

export type ClipVariant = keyof typeof VARIANTS;

const clip =
  'clip-btn inline-flex min-h-[2.75rem] w-fit items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors motion-reduce:transition-none';

export function ClipLink({
  to,
  children,
  variant = 'brass',
  arrow = false,
}: {
  to: string;
  children: ReactNode;
  variant?: ClipVariant;
  arrow?: boolean;
}) {
  return (
    <Link to={to} className={`${clip} ${VARIANTS[variant]}`}>
      {children}
      {arrow ? <ArrowRight size={16} aria-hidden="true" className={variant === 'navy' ? 'text-brass' : undefined} /> : null}
    </Link>
  );
}

export function ClipButton({
  children,
  variant = 'brass',
  disabled,
  type = 'submit',
  onClick,
  className = '',
}: {
  children: ReactNode;
  variant?: ClipVariant;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${clip} ${VARIANTS[variant]} disabled:cursor-progress disabled:opacity-70 ${className}`}
    >
      {children}
    </button>
  );
}

/** A page heading block used at the top of the inner pages, on the navy ground. */
export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-12 max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display text-6xl leading-none tracking-wide text-cream md:text-7xl">{title}</h1>
      {children ? <div className="mt-4 leading-relaxed text-mist">{children}</div> : null}
    </header>
  );
}
