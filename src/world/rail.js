// @ts-check
import { buildJourney } from './journey.js';
// Each road taken is named as the world names it, the signposts' labels (2026-11-26: the rail had kept
// "family/" after the 2026-11-25 rename of road B to "templates/custom/").
import { ROAD_NAMES } from './roadNames.js';

/** @typedef {import('./worldTrack.js').TrackSection} TrackSection */
/** @typedef {import('./route.js').Route} Route */

/**
 * A stop on the journey rail: what it is called, a stable id (the stop's own, or the opening's), the
 * share of the journey it starts at, and where a jump to it lands, in scroll pixels (2026-11-26).
 * @typedef {{ id: string, name: string, from: number, y: number }} RailStop
 */

/**
 * The home page's stops for the journey rail (Code World W4), each at the share of the journey it
 * starts at: the empty file (the gate), into the code and the fork (the opening), the road taken, each
 * of its stops (the meeting stops included), and shipped as the brief arrives. The journey runs from the top
 * of the page to the brief (the end section's end), or to the last section without one.
 * Each also carries where a jump to it lands (2026-11-26, Phase 2): the top of the page for the empty
 * file, where the rail says it starts for the opening's stops, the start of its rest for a road stop
 * (as scrolling there arrives), and the brief itself for shipped, once the world has faded. Each is
 * rounded up to a whole pixel: sections start between pixels, and a page moved to the pixel just before
 * a rest's start is still on the road (found by `e2e/worldjump.spec.js`).
 * @param {Route} route
 * @param {ReadonlyArray<TrackSection>} sections From `measureSections`.
 * @returns {RailStop[]}
 */
export function railStops(route, sections) {
  const end = sections.find((s) => s.kind === 'end');
  const total = journeyLength(sections);
  const share = (/** @type {number} */ y) => Math.min(1, Math.max(0, y / total));
  /** @type {RailStop[]} */
  const stops = [{ id: 'empty-file', name: 'Empty file', from: 0, y: 0 }];
  const opening = sections.find((s) => s.kind === 'opening');
  const door = route.road?.door ?? null;
  if (opening) {
    stops.push({ id: 'into-the-code', name: 'Into the code', from: share(opening.from), y: Math.ceil(opening.from) });
    const { splitAt } = buildJourney(door);
    const fork = opening.from + (opening.to - opening.from) * splitAt;
    stops.push({ id: 'the-fork', name: 'The fork', from: share(fork), y: Math.ceil(fork) });
    if (door) stops.push({ id: door === 'a' ? 'business-road' : 'family-road', name: ROAD_NAMES[door], from: share(opening.to), y: Math.ceil(opening.to) });
  }
  for (const section of sections) {
    if (section.kind !== 'rest' || !route.road || !section.stopId) continue;
    const stop = route.road.stops.find((s) => s.id === section.stopId);
    if (stop) stops.push({ id: stop.id, name: stop.name, from: share(section.from), y: Math.ceil(section.from) });
  }
  // Shipped as the brief arrives: three quarters of the way through the world's fade before it, so a
  // page that cannot scroll the last few pixels still gets there. A jump goes on to the brief itself.
  if (end) stops.push({ id: 'brief', name: 'Shipped', from: share(end.from + 0.75 * (end.to - end.from)), y: Math.ceil(end.to) });
  return stops;
}

/**
 * The journey's length in scroll pixels, as the rail measures it: to the brief (the end section's
 * end), or to the last section's end without one.
 * @param {ReadonlyArray<TrackSection>} sections
 */
export function journeyLength(sections) {
  const end = sections.find((s) => s.kind === 'end');
  const last = sections.length > 0 ? sections[sections.length - 1].to : 1;
  return Math.max(1, end ? end.to : last);
}
