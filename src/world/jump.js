// @ts-check
import { driveAt } from './drive.js';
import { glideTo } from '../scroll/glide.js';

/**
 * Jumps along the journey rail (2026-11-26, Phase 2: "keep the length but add the jumps"). A jump plays
 * the drive between pages (W5b, `drive.js`) within the home page: the camera drives on ahead out of the
 * world it was looking at as it fades, the page moves to the stop at once at the swap, and the camera
 * comes in from behind the stop as it fades in. Nothing between the two stops is drawn. The home's world
 * registers itself here while it runs (as the scroll engine does in `glide.js`); without it (reduced
 * motion, no WebGL2, a world that failed) a jump simply moves the page.
 */

/** @typedef {(y: number, onArrive?: () => void) => void} JumpHandler */
/** @typedef {{ start: number, y: number, scrolled: boolean }} Jump */

/** @type {JumpHandler | null} */
let handler = null;

/**
 * Called by the home's world with its jump, and with null when it stops.
 * @param {JumpHandler | null} next
 */
export function setJumpHandler(next) {
  handler = next;
}

/**
 * Jumps the home page to `y` (a document offset in CSS pixels, from `railStops`), calling `onArrive`
 * once the page is there.
 * @param {number} y
 * @param {() => void} [onArrive]
 */
export function requestJump(y, onArrive) {
  if (handler) {
    handler(y, onArrive);
    return;
  }
  glideTo(y, { instant: true });
  onArrive?.();
}

/**
 * Where a jump is at `now`: the drive (its half, travel and how much of its world shows; null once it is
 * over), and the place to move the page to on this frame: the jump's target once, at the swap (again if
 * the target changed after it), or at the end if its frames were missed (a hidden tab).
 * @param {Jump} jump
 * @param {number} now
 * @returns {{ drive: ReturnType<typeof driveAt>, scrollTo: number | null, done: boolean }}
 */
export function jumpStep(jump, now) {
  const drive = driveAt(now - jump.start);
  if (!drive) return { drive: null, scrollTo: jump.scrolled ? null : jump.y, done: true };
  return { drive, scrollTo: drive.half === 'in' && !jump.scrolled ? jump.y : null, done: false };
}

/**
 * Lets go of the jump `own` registered, unless another has taken its place since (a world mounted again
 * under StrictMode, or after a lost GPU context).
 * @param {JumpHandler} own
 */
export function clearJumpHandler(own) {
  if (handler === own) handler = null;
}
