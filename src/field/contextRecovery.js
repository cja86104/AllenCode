// @ts-check

/**
 * How long a visible page waits for the browser to restore a lost WebGL context before the field
 * restarts on a fresh canvas anyway.
 */
export const RESTORE_WAIT_MS = 2000;

/**
 * @typedef {object} VisibilityDocument The part of `document` the watcher needs.
 * @property {DocumentVisibilityState} visibilityState
 * @property {(type: 'visibilitychange', listener: () => void) => void} addEventListener
 * @property {(type: 'visibilitychange', listener: () => void) => void} removeEventListener
 */

/**
 * Keeps the field alive through a lost WebGL context. Phones drop a page's GPU context when it
 * goes to the background, the screen locks or memory runs short. On a loss this asks the browser to
 * restore the context (by cancelling the event) and calls `onLost` so drawing stops. It calls
 * `onRestart` once: when the browser restores the context, or when the page has been visible for
 * `waitMs` without a restore. Time in the background does not count toward the wait.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ onLost: () => void, onRestart: () => void, waitMs?: number, doc?: VisibilityDocument }} opts
 * @returns {() => void} Stops watching.
 */
export function watchContext(canvas, { onLost, onRestart, waitMs = RESTORE_WAIT_MS, doc = document }) {
  let lost = false;
  let finished = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null;

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const restart = () => {
    if (finished) return;
    finished = true;
    clearTimer();
    onRestart();
  };
  const arm = () => {
    clearTimer();
    if (lost && !finished && doc.visibilityState === 'visible') timer = setTimeout(restart, waitMs);
  };

  /** @param {Event} event */
  const handleLost = (event) => {
    event.preventDefault();
    if (lost || finished) return;
    lost = true;
    onLost();
    arm();
  };
  const handleRestored = () => {
    if (lost) restart();
  };

  canvas.addEventListener('webglcontextlost', handleLost);
  canvas.addEventListener('webglcontextrestored', handleRestored);
  doc.addEventListener('visibilitychange', arm);

  return () => {
    finished = true;
    clearTimer();
    canvas.removeEventListener('webglcontextlost', handleLost);
    canvas.removeEventListener('webglcontextrestored', handleRestored);
    doc.removeEventListener('visibilitychange', arm);
  };
}
