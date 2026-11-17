// @ts-check
import { budgetFor, EDGE_SPACING_BY_TIER, editorSlab, landmarkStand, roadEdges, SCREEN_FLOOR, screenSculpture, unfinishedSlab } from './shapes.js';
import { STRETCH_LEAD_AT } from './stretchLayout.js';
import { wordRoad } from './wordRoad.js';
import { landedShape } from './worldFlight.js';

/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {'low' | 'mid' | 'high'} Tier */
/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */

/** The stretch's road is as wide as the home road beyond the fork. */
const ROAD_WIDTH = 3.2;
/** The word runs from the road's origin (its belt wraps there) to this short of the lead. */
const WORD_SHORT_OF_LEAD = 2;

/**
 * An inner page's world (Code World W5a; 2026-11-17: "just have the path leading forward … with the
 * screen at the end and that word for what section being the scrolling road"): its straight road, the
 * page's word spelled along it in big letters of the road's characters running forward (`wordRoad`),
 * its green and orange edges, and its one stop on a stand at the end: a screen sculpture of its excerpt
 * for a product, service, template or portrait (with its picture in characters once read, tagged so the
 * renderer shows it once its code lifts off), Crew Advisors' file unfinished with its cursor, or the
 * empty file's code as a slab. Within the tier's budget: the word, edges, stand and slabs are exact, and
 * a screen takes what is left.
 * @param {Tier} tier
 * @param {{ road: string, stops: Readonly<Record<string, string>> }} sources The road's code and each stop's by excerpt id.
 * @param {number} seed
 * @param {{ stops: ReadonlyArray<import('./roads.js').RoadStop>, layout: ReturnType<typeof import('./stretchLayout.js').layoutStretch>, word: string }} stretch
 * @param {Readonly<Record<string, Pixels>>} [landed] Each screen landmark's picture, once read.
 * @returns {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>}
 */
export function buildStretchWorld(tier, sources, seed, { stops, layout, word }, landed = {}) {
  const edges = roadEdges(sources.road, { path: layout.path, width: ROAD_WIDTH, spacing: EDGE_SPACING_BY_TIER[tier] }, seed + 1);
  const stands = layout.landmarks.map((landmark, n) => landmarkStand(sources.road, landmark, seed + 10 + n));

  /** @type {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>} */
  const exact = [];
  /** @type {Array<{ stopId: string, landmark: import('./roadLayout.js').Landmark, code: string, place: number }>} */
  const screens = [];
  stops.forEach((stop, k) => {
    const landmark = layout.landmarks.find((l) => l.stopId === stop.id);
    const code = stop.excerptId ? sources.stops[stop.excerptId] : undefined;
    if (!landmark || code === undefined) throw new Error(`The stretch has no landmark or code for ${stop.id}.`);
    if (stop.kind === 'unfinished') {
      const shape = unfinishedSlab(code, { center: landmark.center, facing: landmark.facing }, seed + 20 + k);
      exact.push({ name: `landmark:${stop.id}`, shape, stopId: stop.id, cursor: shape.cursor });
    } else if (stop.kind === 'audit') {
      exact.push({ name: `landmark:${stop.id}`, shape: editorSlab(code, seed + 20 + k, { center: landmark.center, facing: landmark.facing }), stopId: stop.id });
    } else {
      screens.push({ stopId: stop.id, landmark, code, place: k + 1 });
    }
  });

  const road = wordRoad(word, { near: 0, far: -(STRETCH_LEAD_AT - WORD_SHORT_OF_LEAD), width: ROAD_WIDTH }, sources.road, seed + 2);
  const fixed = [road, edges, ...stands, ...exact.map((part) => part.shape)].reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const remainder = budgetFor(tier) - fixed;
  if (remainder < SCREEN_FLOOR[tier] * screens.length) throw new Error(`The ${tier} budget leaves too few glyphs for the stretch's screen.`);
  const perScreen = screens.length > 0 ? Math.floor(remainder / screens.length) : 0;

  return [
    { name: 'road', shape: road },
    { name: 'edges', shape: edges },
    ...layout.landmarks.map((landmark, n) => ({ name: `stand:${landmark.stopId}`, shape: stands[n] })),
    ...screens.flatMap(({ stopId, landmark, code, place }, n) => {
      const image = landed[stopId];
      const count = image ? Math.floor(perScreen / 2) : perScreen;
      const sculpture = screenSculpture(code, { width: landmark.width, height: landmark.height, center: landmark.center, count, facing: landmark.facing }, seed + 30 + n);
      if (!image) return [{ name: `landmark:${stopId}`, stopId, shape: sculpture }];
      // The picture's grid step, in the image's pixels, for about the other half of the share.
      const step = Math.max(1, Math.sqrt((image.width * image.height) / Math.max(1, perScreen - count)));
      return [
        { name: `landmark:${stopId}`, stopId, shape: { ...sculpture, tag: place } },
        { name: `landed:${stopId}`, stopId, shape: { ...landedShape(image, landmark, code, step), tag: -place } },
      ];
    }),
    ...exact,
  ];
}
