// @ts-check
import { useSyncExternalStore } from 'react';

/**
 * @typedef {object} FieldState
 * @property {number} progress Scroll progress of the current page, 0 to 1.
 * @property {'a' | 'b' | null} door The visitor's chosen door, or null before the fork.
 * @property {number} intensity Ambient field brightness multiplier; 1 is the resting field.
 * @property {import('./types.js').TransformSpec | null} transform The transformation a scene is playing, or null.
 * @property {number} transformProgress Progress of that transformation, 0 (code in the file) to 1 (landed).
 * @property {'pending' | 'webgl' | 'static'} mode Whether the glyph renderer is running ('webgl'), chapters
 *   must show their code beside their result ('static'), or the field has not decided yet ('pending').
 *
 * @typedef {object} FieldBus
 * @property {() => FieldState} get
 * @property {(patch: Partial<FieldState>) => void} set
 * @property {(listener: () => void) => () => void} subscribe
 * @property {(spec: import('./types.js').TransformSpec) => void} claimTransform Plays this transformation from
 *   the start; the scene that claims it owns it until it releases it or another scene claims.
 * @property {(key: string) => void} releaseTransform Clears the transformation only if `key` still owns it.
 * @property {(key: string, progress: number) => void} setTransformProgress Moves the transformation only if `key` owns it.
 */

/** @type {FieldState} */
const INITIAL_STATE = Object.freeze({ progress: 0, door: null, intensity: 1, transform: null, transformProgress: 0, mode: 'pending' });

/**
 * A minimal external store shared by the field, the scroll engine and the scenes.
 * @returns {FieldBus}
 */
export function createFieldBus() {
  let state = INITIAL_STATE;
  /** @type {Set<() => void>} */
  const listeners = new Set();

  /** @param {Partial<FieldState>} patch */
  const set = (patch) => {
    const keys = /** @type {(keyof FieldState)[]} */ (Object.keys(patch));
    if (keys.every((key) => Object.is(state[key], patch[key]))) return;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  /** @param {string} key */
  const owns = (key) => state.transform !== null && state.transform.key === key;

  return {
    get: () => state,
    claimTransform(spec) {
      set({ transform: spec, transformProgress: 0 });
    },
    releaseTransform(key) {
      if (owns(key)) set({ transform: null, transformProgress: 0 });
    },
    setTransformProgress(key, progress) {
      if (owns(key)) set({ transformProgress: progress });
    },
    set,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** The app-wide field store. */
export const fieldBus = createFieldBus();

/**
 * Subscribes a component to the app-wide field store.
 * @returns {FieldState}
 */
export function useField() {
  return useSyncExternalStore(fieldBus.subscribe, fieldBus.get, fieldBus.get);
}
