// @ts-check
import {
  budgetFor,
  codeRoad,
  EDGE_SPACING_BY_TIER,
  editorSlab,
  landmarkStand,
  ROAD_DENSITY,
  roadEdges,
  scatterCount,
  SCREEN_FLOOR,
  screenSculpture,
  unfinishedSlab,
} from './shapes.js';
import { landedShape } from './worldFlight.js';

/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {'low' | 'mid' | 'high'} Tier */
/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */

/** The stretch's road is as wide as the home road beyond the fork. */
const ROAD_WIDTH = 3.2;

/**
 * An inner page's world (Code World W5a): its straight road of the home road's code at the
 * opening's density, ember edges, and a landmark on a stand for each stop: a screen sculpture of its
 * excerpt for a product, service, template or portrait (with its picture in characters once read,
 * tagged by its place so the renderer shows it once passed, as on the home road), Crew Advisors' file
 * unfinished with its cursor, and the audit's and the empty file's code as slabs. Within the tier's
 * budget: edges, stands and slabs are exact, the road's scatter is laid by `ROAD_DENSITY` and gives way
 * so every screen keeps `SCREEN_FLOOR`, and the screens share what is left.
 * @param {Tier} tier
 * @param {{ road: string, stops: Readonly<Record<string, string>> }} sources The road's code and each stop's by excerpt id.
 * @param {number} seed
 * @param {{ stops: ReadonlyArray<import('./roads.js').RoadStop>, layout: ReturnType<typeof import('./stretchLayout.js').layoutStretch> }} stretch
 * @param {Readonly<Record<string, Pixels>>} [landed] Each screen landmark's picture, once read.
 * @returns {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>}
 */
export function buildStretchWorld(tier, sources, seed, { stops, layout }, landed = {}) {
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

  const fixed = [edges, ...stands, ...exact.map((part) => part.shape)].reduce((sum, shape) => sum + shape.glyphs.length, 0);
  let scatter = scatterCount(ROAD_DENSITY[tier], layout.path, ROAD_WIDTH);
  const floor = SCREEN_FLOOR[tier];
  // The budget, not the density, is the limit: the scatter gives way so every screen keeps its floor.
  scatter = Math.max(0, Math.min(scatter, budgetFor(tier) - fixed - floor * screens.length));
  const remainder = budgetFor(tier) - fixed - scatter;
  if (remainder < floor * screens.length) throw new Error(`The ${tier} budget leaves too few glyphs for the stretch's screens.`);
  const perScreen = screens.length > 0 ? Math.floor(remainder / screens.length) : 0;

  return [
    { name: 'road', shape: codeRoad(sources.road, { path: layout.path, width: ROAD_WIDTH, count: scatter }, seed + 2) },
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
