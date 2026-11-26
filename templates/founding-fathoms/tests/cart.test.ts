import { describe, expect, it } from 'vitest';
import { brewery } from '../src/content/brewery';
import {
  MAX_QUANTITY,
  cartCount,
  cartLines,
  cartReducer,
  cartTotal,
  holdsBeer,
  money,
  parseStoredCart,
  type CartItem,
} from '../src/lib/cart';

const products = brewery.shop.products;

describe('the cart', () => {
  it('adds, counts up, sets and removes', () => {
    let items: CartItem[] = [];
    items = cartReducer(items, { type: 'add', id: 'harbor-lights-4' });
    items = cartReducer(items, { type: 'add', id: 'harbor-lights-4' });
    items = cartReducer(items, { type: 'add', id: 'work-cap' });
    expect(items).toEqual([
      { id: 'harbor-lights-4', quantity: 2 },
      { id: 'work-cap', quantity: 1 },
    ]);
    items = cartReducer(items, { type: 'set', id: 'work-cap', quantity: 3 });
    expect(items[1]).toEqual({ id: 'work-cap', quantity: 3 });
    items = cartReducer(items, { type: 'set', id: 'work-cap', quantity: 0 });
    expect(items).toEqual([{ id: 'harbor-lights-4', quantity: 2 }]);
    expect(cartReducer(items, { type: 'remove', id: 'harbor-lights-4' })).toEqual([]);
    expect(cartReducer(items, { type: 'clear' })).toEqual([]);
  });

  it('never holds more than the most for one order', () => {
    let items: CartItem[] = [{ id: 'pint-glass', quantity: MAX_QUANTITY }];
    items = cartReducer(items, { type: 'add', id: 'pint-glass' });
    expect(items[0]?.quantity).toBe(MAX_QUANTITY);
    expect(cartReducer(items, { type: 'set', id: 'pint-glass', quantity: 99 })[0]?.quantity).toBe(MAX_QUANTITY);
  });

  it('takes names and prices from the content, drops products no longer sold, and totals in cents', () => {
    const lines = cartLines(
      [
        { id: 'harbor-lights-4', quantity: 2 },
        { id: 'retired-stout', quantity: 1 },
        { id: 'crew-tee', quantity: 1 },
      ],
      products,
    );
    expect(lines.map((line) => [line.product.name, line.total])).toEqual([
      ['Harbor Lights IPA', 32],
      ['Brewhouse Crew Tee', 32],
    ]);
    expect(cartCount(lines)).toBe(3);
    expect(cartTotal(lines)).toBe(64);
    expect(holdsBeer(lines)).toBe(true);
    expect(holdsBeer(lines.slice(1))).toBe(false);
    const cents = cartLines(
      [{ id: 'sticker', quantity: 3 }],
      [{ id: 'sticker', name: 'Sticker', category: 'Gear', price: 0.1, description: 'A die-cut sticker.' }],
    );
    expect(cartTotal(cents)).toBe(0.3);
    expect(money(64)).toBe('$64.00');
  });

  it('reads a saved cart and ignores anything malformed', () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart('not json')).toEqual([]);
    expect(parseStoredCart('{"id":"x"}')).toEqual([]);
    expect(
      parseStoredCart(
        JSON.stringify([
          { id: 'work-cap', quantity: 2 },
          { id: 'pint-glass', quantity: 40 },
          { id: 'crew-tee', quantity: 0 },
          { id: 7, quantity: 1 },
          null,
        ]),
      ),
    ).toEqual([
      { id: 'work-cap', quantity: 2 },
      { id: 'pint-glass', quantity: MAX_QUANTITY },
    ]);
  });
});
