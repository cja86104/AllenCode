// @ts-check
import { buildJourney } from './journey.js';
// Each road taken is named as the world names it, the signposts' labels (2026-11-26: the rail had kept
// "family/" after the 2026-11-25 rename of road B to "templates/custom/").
import { ROAD_NAMES } from './roadNames.js';

/** @typedef {import('./worldTrack.js').TrackSection} TrackSection */
/** @typedef {import('./route.js').Route} Route */

/**
 * The home page's stops for the journey rail (Code World W4), each at the share of the journey it
 * starts at: the empty file (the gate), into the code and the fork (the opening), the road taken, each
 * of its stops (the meeting stops included), and shipped as the brief arrives. The journey runs from the top
 * of the page to the brief (the end section's end), or to the last section without one.
 * @param {Route} route
 * @param {ReadonlyArray<TrackSection>} sections From `measureSections`.
 * @returns {Array<{ name: string, from: number }>}
 */
export function railStops(route, sections) {
  const end = sections.find((s) => s.kind === 'end');
  const total = journeyLength(sections);
  const share = (/** @type {number} */ y) => Math.min(1, Math.max(0, y / total));
  /** @type {Array<{ name: string, from: number }>} */
  const stops = [{ name: 'Empty file', from: 0 }];
  const opening = sections.find((s) => s.kind === 'opening');
  const door = route.road?.door ?? null;
  if (opening) {
    stops.push({ name: 'Into the code', from: share(opening.from) });
    const { splitAt } = buildJourney(door);
    stops.push({ name: 'The fork', from: share(opening.from + (opening.to - opening.from) * splitAt) });
    if (door) stops.push({ name: ROAD_NAMES[door], from: share(opening.to) });
  }
  for (const section of sections) {
    if (section.kind !== 'rest' || !route.road) continue;
    const stop = route.road.stops.find((s) => s.id === section.stopId);
    if (stop) stops.push({ name: stop.name, from: share(section.from) });
  }
  // Shipped as the brief arrives: three quarters of the way through the world's fade before it, so a
  // page that cannot scroll the last few pixels still gets there.
  if (end) stops.push({ name: 'Shipped', from: share(end.from + 0.75 * (end.to - end.from)) });
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
