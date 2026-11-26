import type { Product } from '../content/types';

/** One product in the cart. Only the id and quantity are kept; names and prices always come from the content. */
export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  total: number;
}

/** The most of any one product a single pickup order can hold. */
export const MAX_QUANTITY = 12;

export const CART_STORAGE_KEY = 'founding-fathoms:cart';

export type CartAction =
  | { type: 'add'; id: string }
  | { type: 'set'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'restore'; items: CartItem[] };

const clamp = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity)));

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = items.find((item) => item.id === action.id);
      if (!existing) return [...items, { id: action.id, quantity: 1 }];
      return items.map((item) => (item.id === action.id ? { ...item, quantity: clamp(item.quantity + 1) } : item));
    }
    case 'set': {
      const quantity = clamp(action.quantity);
      if (quantity === 0) return items.filter((item) => item.id !== action.id);
      return items.map((item) => (item.id === action.id ? { ...item, quantity } : item));
    }
    case 'remove':
      return items.filter((item) => item.id !== action.id);
    case 'clear':
      return [];
    case 'restore':
      return action.items;
  }
}

/** The cart joined to the shop's products. Items for products no longer sold are dropped. */
export function cartLines(items: CartItem[], products: Product[]): CartLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return items.flatMap((item) => {
    const product = byId.get(item.id);
    return product ? [{ product, quantity: item.quantity, total: product.price * item.quantity }] : [];
  });
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** The total in cents, then back to dollars, so sums of prices like $16.50 never drift. */
export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + Math.round(line.total * 100), 0) / 100;
}

/** Whether the order holds beer, so the buyer must confirm their age and bring ID. */
export function holdsBeer(lines: CartLine[]): boolean {
  return lines.some((line) => line.product.category === 'Beer');
}

/** Reads a saved cart, ignoring anything that isn't a list of `{ id, quantity }`. */
export function parseStoredCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return [];
      const { id, quantity } = entry as { id?: unknown; quantity?: unknown };
      if (typeof id !== 'string' || typeof quantity !== 'number') return [];
      const clamped = clamp(quantity);
      return clamped > 0 ? [{ id, quantity: clamped }] : [];
    });
  } catch {
    return [];
  }
}

/** "$16.00": totals always show cents. */
export function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
