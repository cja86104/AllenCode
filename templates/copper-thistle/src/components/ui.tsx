import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** The small spaced capitals above a heading. `tone` picks a colour that stays readable on its ground. */
export function Eyebrow({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <p className={`mb-3 text-xs font-medium uppercase tracking-[0.3em] ${tone === 'light' ? 'text-gold-ink' : 'text-gold'} ${className}`}>
      {children}
    </p>
  );
}

const pill =
  'group relative inline-flex min-h-[2.75rem] items-center justify-center overflow-hidden rounded-full border px-8 py-3.5 text-sm uppercase tracking-[0.2em]';
const fill =
  'absolute inset-0 -translate-x-[101%] transition-transform duration-500 ease-out group-hover:translate-x-0 motion-reduce:transition-none';
const label = 'relative z-10 transition-colors duration-500 motion-reduce:transition-none';

/** The outlined pill with a fill that slides in on hover; `tone` sets its colours for a light or dark ground. */
export function PillLink({ to, children, tone = 'dark' }: { to: string; children: ReactNode; tone?: 'light' | 'dark' }) {
  return tone === 'dark' ? (
    <Link to={to} className={`${pill} border-gold text-cream`}>
      <span aria-hidden="true" className={`${fill} bg-gold`} />
      <span className={`${label} group-hover:text-charcoal`}>{children}</span>
    </Link>
  ) : (
    <Link to={to} className={`${pill} border-burgundy text-burgundy`}>
      <span aria-hidden="true" className={`${fill} bg-burgundy`} />
      <span className={`${label} group-hover:text-cream`}>{children}</span>
    </Link>
  );
}

export function PillButton({
  children,
  tone = 'dark',
  disabled,
  type = 'submit',
  onClick,
  className = '',
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  className?: string;
}) {
  const colours = tone === 'dark' ? 'border-gold text-cream' : 'border-burgundy text-burgundy';
  const fillColour = tone === 'dark' ? 'bg-gold' : 'bg-burgundy';
  const hoverText = tone === 'dark' ? 'group-hover:text-charcoal' : 'group-hover:text-cream';
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${pill} ${colours} disabled:cursor-progress disabled:opacity-70 ${className}`}
    >
      <span aria-hidden="true" className={`${fill} ${fillColour}`} />
      <span className={`${label} ${hoverText}`}>{children}</span>
    </button>
  );
}

/** A page heading block used at the top of the inner pages. */
export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-12 max-w-xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display text-5xl italic md:text-6xl">{title}</h1>
      {children ? <div className="mt-4 leading-relaxed text-stone">{children}</div> : null}
    </header>
  );
}
