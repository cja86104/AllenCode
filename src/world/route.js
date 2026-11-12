// @ts-check
import { getExcerpt } from '../content/excerpts/index.js';
import { businessRoadStops } from './roads.js';
import { layoutRoad, roadSizes } from './roadLayout.js';
import { buildJourney } from './journey.js';
import { CURSOR } from './shapes.js';

/** @typedef {import('./journey.js').Door} Door */
/** @typedef {import('./roads.js').RoadStop} RoadStop */

/**
 * A visitor's route: the journey (the page's length and the camera's path) and, once a road with
 * stops is taken, that road: its stops, where everything on it stands, and its approved code.
 * @typedef {{
 *   journey: import('./journey.js').Journey,
 *   road: { door: Door, stops: RoadStop[], layout: ReturnType<typeof layoutRoad>, sources: Record<string, string> } | null,
 * }} Route
 */

/** @type {Map<string, Route>} */
const routes = new Map();

/**
 * Every approved excerpt the business road uses, by id.
 * @param {ReadonlyArray<RoadStop>} stops
 */
function sourcesOf(stops) {
  /** @type {Record<string, string>} */
  const sources = {};
  for (const stop of stops) {
    const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
    if (excerpt && stop.excerptId) sources[stop.excerptId] = excerpt.code;
  }
  return sources;
}

/**
 * The route for a door, built once and shared, so the canvas (which draws it) and the page (whose
 * height and words follow it) always agree on where the visitor is (Code World W2.4). The business
 * road has its stops (W2); the fork and the family road are W1's until W3.
 * @param {Door | null} door
 * @returns {Route}
 */
export function routeFor(door) {
  const key = door ?? 'none';
  const known = routes.get(key);
  if (known) return known;
  /** @type {Route} */
  let route;
  if (door === 'a') {
    const stops = businessRoadStops();
    const sources = sourcesOf(stops);
    const sizes = roadSizes(stops, sources);
    route = { journey: buildJourney(door, stops, sizes), road: { door, stops, layout: layoutRoad(stops, door, sizes), sources } };
  } else {
    route = { journey: buildJourney(door), road: null };
  }
  routes.set(key, route);
  return route;
}

/** Every character a road may draw, and the cursor: for the glyph atlas, drawn once. */
export function roadGlyphs() {
  return Object.values(routeFor('a').road?.sources ?? {}).join('') + CURSOR;
}
