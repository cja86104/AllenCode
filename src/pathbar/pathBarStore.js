// @ts-check
import { useSyncExternalStore } from 'react';

/** The narrowest window, in CSS px, that shows the path bar as its own row (narrower: the phone's chip). */
export const PATH_BAR_MIN_WIDTH = 768;

/**
 * The header's bottom with the path bar under the navigation, in CSS px: its 44 px row and border take the
 * header to 112 px from 768 px to 1279 px and 107 px from 1280 px. Pinned words never sit above it.
 */
export const PATH_BAR_FLOOR_PX = 112;

/** Whether the path bar is mounted (the world off). Set by the bar itself. */
let shown = false;
/** @type {Set<() => void>} */
const listeners = new Set();

/**
 * The bar marks itself shown while mounted (Living Source Phase 3), so a pinned chapter, which may render
 * outside the router, can keep its words below it.
 * @param {boolean} next
 */
export function setPathBarShown(next) {
  if (shown === next) return;
  shown = next;
  listeners.forEach((listener) => listener());
}

/** @returns {boolean} */
export function readPathBarShown() {
  return shown;
}

/** @param {() => void} listener */
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Whether the path bar is mounted, followed live. False in the server render and while hydrating; the
 * bar mounts in the same pass, so a chapter takes its floor a frame later, before any scroll.
 * @returns {boolean}
 */
export function usePathBarShown() {
  return useSyncExternalStore(subscribe, readPathBarShown, () => false);
}

/**
 * The highest a pinned chapter's words may sit, in px from its frame's top: the header's bottom while the
 * path bar shows its row (`width` at least 768 px), otherwise 0 (the layout's place stands).
 * @param {number} width The frame's width.
 * @returns {number}
 */
export function useWordsFloor(width) {
  return usePathBarShown() && width >= PATH_BAR_MIN_WIDTH ? PATH_BAR_FLOOR_PX : 0;
}
