import type { ReactNode, RefObject } from 'react';

type Ground = 'light' | 'dark';

const labelClass: Record<Ground, string> = {
  light: 'mb-2 block text-xs uppercase tracking-[0.15em] text-stone',
  dark: 'mb-2 block text-xs uppercase tracking-[0.15em] text-mist',
};

export const inputClass: Record<Ground, string> = {
  light:
    'w-full min-h-[2.875rem] border border-stone/60 bg-transparent px-4 py-3 focus:border-gold-ink focus:outline-none aria-[invalid=true]:border-burgundy aria-[invalid=true]:border-2',
  dark: 'w-full min-h-[2.875rem] border border-mist/60 bg-charcoal px-4 py-3 text-cream focus:border-gold focus:outline-none aria-[invalid=true]:border-gold aria-[invalid=true]:border-2',
};

const errorClass: Record<Ground, string> = {
  light: 'mt-1 text-sm font-medium text-burgundy',
  dark: 'mt-1 text-sm font-medium text-gold',
};

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  ground?: Ground;
  children: ReactNode;
}

/** A labelled field with its hint and error tied to the control by id. */
export function Field({ id, label, error, hint, optional, ground = 'light', children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass[ground]}>
        {label}
        {optional ? <span className="normal-case tracking-normal"> (optional)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className={`mt-1 text-sm ${ground === 'light' ? 'text-stone' : 'text-mist'}`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={errorClass[ground]}>
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The ids a control should be described by: its hint and, when present, its error. */
export function describedBy(id: string, options: { hint?: boolean; error?: string }): string | undefined {
  const ids = [options.hint ? `${id}-hint` : '', options.error ? `${id}-error` : ''].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** Shown in place of a form when no endpoint is configured: nothing was sent, here is what a guest would see. */
export function DemonstrationResult({
  ground = 'light',
  wouldSee,
  onBack,
  headingRef,
  headingLevel = 3,
}: {
  ground?: Ground;
  wouldSee: string;
  onBack: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
  /** 2 when the result replaces the form's own heading, so the page's outline has no gap. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const muted = ground === 'light' ? 'text-stone' : 'text-mist';
  return (
    <div className="py-4">
      <p className={`mb-2 text-xs font-medium uppercase tracking-[0.25em] ${ground === 'light' ? 'text-gold-ink' : 'text-gold'}`}>
        Template preview
      </p>
      <Heading ref={headingRef} tabIndex={-1} className="mb-3 font-display text-2xl italic focus:outline-none">
        Nothing was sent.
      </Heading>
      <p className={`mb-4 ${muted}`}>
        This form isn’t connected yet, so your details haven’t gone anywhere. On the live site, a guest would see:
      </p>
      <blockquote className={`mb-6 border-l-2 pl-4 font-display italic ${ground === 'light' ? 'border-gold-ink' : 'border-gold'}`}>
        {wouldSee}
      </blockquote>
      <button
        type="button"
        onClick={onBack}
        className={`min-h-[2.75rem] border-b pb-1 text-sm uppercase tracking-[0.2em] ${ground === 'light' ? 'border-gold-ink text-gold-ink' : 'border-gold text-gold'}`}
      >
        Back to the form
      </button>
    </div>
  );
}
