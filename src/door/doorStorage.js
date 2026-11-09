// @ts-check

/** @typedef {'a' | 'b'} Door 'a': building a product or business. 'b': a site for me or my family. */

export const DOOR_STORAGE_KEY = 'allencode:door';

/**
 * The door chosen earlier in this browser session, or null. Never throws: blocked or unavailable
 * storage reads as no choice, so the fork is simply shown again.
 * @returns {Door | null}
 */
export function readDoor() {
  try {
    const value = window.sessionStorage.getItem(DOOR_STORAGE_KEY);
    return value === 'a' || value === 'b' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Remembers the door for this browser session. Never throws: when storage is blocked or full the
 * choice still applies to the current page, it just is not remembered.
 * @param {Door} door
 */
export function writeDoor(door) {
  try {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, door);
  } catch {
    // Storage is blocked or full; the in-memory choice still applies (spec section 8).
  }
}
