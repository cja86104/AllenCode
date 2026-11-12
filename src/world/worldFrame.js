// @ts-check

/**
 * What the canvas tells the page each frame (Code World W2.4): how far along the journey the visitor
 * is, the landmark handing over to its real thing (and where it is on screen, in CSS pixels), how
 * much of Crew Advisors' file is typed, and how many of how I work's commits have been passed.
 * @typedef {{
 *   progress: number,
 *   handover: { stopId: string, amount: number, rect: { left: number, top: number, width: number, height: number, visible: boolean } } | null,
 *   typed: number | null,
 *   commits: number,
 * }} WorldFrame
 */

/**
 * A tiny bus from the canvas (in the app shell) to the journey (in the home page). Publishing with
 * no one listening costs nothing; `latest` lets a host that mounts mid-journey start from the last
 * frame instead of waiting for the next.
 */
export function createWorldFrame() {
  /** @type {WorldFrame | null} */
  let last = null;
  /** @type {Set<(frame: WorldFrame) => void>} */
  const listeners = new Set();
  return {
    /** @param {WorldFrame} frame */
    publish(frame) {
      last = frame;
      for (const listener of listeners) listener(frame);
    },
    /** @param {(frame: WorldFrame) => void} listener @returns {() => void} */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** @returns {WorldFrame | null} */
    latest() {
      return last;
    },
  };
}

/** The site's one world frame bus. */
export const worldFrame = createWorldFrame();
