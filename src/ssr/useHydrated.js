// @ts-check
import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';

/** Nothing to subscribe to: the value only differs between the server pass and the browser. */
const subscribe = () => () => {};

/**
 * False on the server and while the browser hydrates a prebuilt page (Phase 9), true from the first
 * render after that. Anything read from the browser during render (session storage, the address's
 * query, the window's size) waits for this, so the browser's first pass matches the HTML it was given.
 * @returns {boolean}
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * `useLayoutEffect` in a browser, so a change lands before the screen paints; `useEffect` on the
 * server, where layout effects never run and React warns about them.
 */
export const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
