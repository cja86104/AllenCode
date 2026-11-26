import { Minus, Plus } from 'lucide-react';
import { MAX_QUANTITY } from '../lib/cart';

/** Fewer and more buttons around a quantity, each named for the product so they make sense out of context. */
export function QuantityStepper({ name, quantity, onChange }: { name: string; quantity: number; onChange: (quantity: number) => void }) {
  const button =
    'inline-flex h-11 w-11 items-center justify-center border border-cream/25 text-cream transition-colors hover:border-brass hover:text-brass disabled:opacity-40';
  return (
    <div className="flex items-center">
      <button type="button" aria-label={`One fewer ${name}`} onClick={() => onChange(quantity - 1)} className={button}>
        <Minus size={14} aria-hidden="true" />
      </button>
      <span className="w-9 text-center tabular-nums" aria-label={`${quantity} of ${name}`}>
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`One more ${name}`}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        className={button}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
