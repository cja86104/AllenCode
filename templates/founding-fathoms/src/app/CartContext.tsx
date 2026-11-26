import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { CART_STORAGE_KEY, cartCount, cartLines, cartReducer, cartTotal, parseStoredCart, type CartLine } from '../lib/cart';
import { useBrewery } from './BreweryContext';

interface Cart {
  lines: CartLine[];
  count: number;
  total: number;
  /** True once the saved cart has been read, so counts never flash a wrong number during hydration. */
  ready: boolean;
  add: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<Cart | null>(null);

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, value);
  } catch {
    // Storage can be full or switched off; the cart still works for this visit.
  }
}

/**
 * The shop cart. It starts empty on the server and in the first browser render, then picks up the cart
 * saved in this browser, so prerendered pages hydrate without a mismatch. Only product ids and
 * quantities are saved; names and prices always come from the content.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { shop } = useBrewery();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    dispatch({ type: 'restore', items: parseStoredCart(readStorage()) });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((id: string) => dispatch({ type: 'add', id }), []);
  const setQuantity = useCallback((id: string, quantity: number) => dispatch({ type: 'set', id, quantity }), []);
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<Cart>(() => {
    const lines = cartLines(items, shop.products);
    return {
      lines,
      count: cartCount(lines),
      total: cartTotal(lines),
      ready,
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    };
  }, [items, shop.products, ready, add, setQuantity, remove, clear, drawerOpen, openDrawer, closeDrawer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside <CartProvider>.');
  return value;
}
