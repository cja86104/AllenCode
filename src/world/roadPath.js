// @ts-check

/**
 * Walking a road's centre line (Code World W4): the road bends where the roads meet, so a place on it
 * is found by its distance along it, not by one straight heading.
 */

/**
 * A point on the road: x and z, and the ground's height there (Chris, 2026-11-16: hills), 0 when
 * absent.
 * @typedef {[number, number, number?]} Point2
 */
/** @typedef {{ path: ReadonlyArray<Point2>, origin: Point2 }} RoadLike A layout from `layoutRoad`: its path passes its origin, the branch's end. */

/**
 * The road from the branch's end on: the part of a layout's path every distance along it is measured on.
 * @param {RoadLike} layout
 */
function roadFrom(layout) {
  const start = layout.path.findIndex((p) => p[0] === layout.origin[0] && p[1] === layout.origin[1]);
  if (start < 0) throw new Error('The road\'s path does not pass its origin.');
  return layout.path.slice(start);
}

/**
 * Where the road is at a distance along it from the branch's end, and which way it runs there (W4: the
 * road is no longer one straight line), and the ground's height there (2026-11-16: hills). Before its
 * start and past its end it carries straight on, at its first or last height.
 * @param {RoadLike} layout
 * @param {number} distance
 * @returns {{ point: [number, number], heading: [number, number], height: number }}
 */
export function roadAt(layout, distance) {
  const road = roadFrom(layout);
  let walked = 0;
  for (let i = 0; i < road.length - 1; i += 1) {
    const [ax, az] = road[i];
    const [bx, bz] = road[i + 1];
    const length = Math.hypot(bx - ax, bz - az);
    const heading = /** @type {[number, number]} */ ([(bx - ax) / length, (bz - az) / length]);
    if (distance < walked + length || i === road.length - 2) {
      const t = distance - walked;
      const share = Math.min(1, Math.max(0, t / length));
      const height = (road[i][2] ?? 0) + ((road[i + 1][2] ?? 0) - (road[i][2] ?? 0)) * share;
      return { point: [ax + heading[0] * t, az + heading[1] * t], heading, height };
    }
    walked += length;
  }
  return { point: [road[0][0], road[0][1]], heading: [0, -1], height: road[0][2] ?? 0 };
}

/**
 * Which way the road runs at a distance along it, smoothed across the joint between its short pieces
 * (2026-11-16: the shaped road is laid in 1-unit pieces, and a stop stands where two meet): the mean of
 * the headings half a unit either side. On a straight road it is the road's heading.
 * @param {RoadLike} layout
 * @param {number} distance
 * @returns {[number, number]}
 */
export function roadHeadingAt(layout, distance) {
  const before = roadAt(layout, distance - 0.5).heading;
  const after = roadAt(layout, distance + 0.5).heading;
  const x = before[0] + after[0];
  const z = before[1] + after[1];
  const length = Math.hypot(x, z) || 1;
  return [x / length, z / length];
}

/**
 * How far along the road (from the branch's end) a point on the ground lies: the distance to its
 * nearest point on the road; before the road's start or past its end, along its first or last heading.
 * @param {RoadLike} layout
 * @param {Readonly<Point2>} p
 */
export function distanceAlongRoad(layout, p) {
  const road = roadFrom(layout);
  let best = { d: Infinity, along: 0 };
  let walked = 0;
  for (let i = 0; i < road.length - 1; i += 1) {
    const [ax, az] = road[i];
    const [bx, bz] = road[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const length = Math.hypot(dx, dz);
    let t = ((p[0] - ax) * dx + (p[1] - az) * dz) / (length * length);
    if (i > 0) t = Math.max(0, t);
    if (i < road.length - 2) t = Math.min(1, t);
    const d = Math.hypot(p[0] - (ax + dx * t), p[1] - (az + dz * t));
    if (d < best.d) best = { d, along: walked + length * t };
    walked += length;
  }
  return best.along;
}

/**
 * The road's centre line between two distances along it, each point with the ground's height.
 * @param {RoadLike} layout @param {number} from @param {number} to
 * @returns {Array<[number, number, number]>}
 */
export function roadBetween(layout, from, to) {
  const road = roadFrom(layout);
  const at = (/** @type {number} */ distance) => {
    const { point, height } = roadAt(layout, distance);
    return /** @type {[number, number, number]} */ ([point[0], point[1], height]);
  };
  const points = [at(from)];
  let walked = 0;
  for (let i = 0; i < road.length - 1; i += 1) {
    walked += Math.hypot(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1]);
    if (walked > from && walked < to) points.push([road[i + 1][0], road[i + 1][1], road[i + 1][2] ?? 0]);
  }
  points.push(at(to));
  return points;
}

/**
 * The road's length from the branch's end to its last point.
 * @param {RoadLike} layout
 */
export function roadLength(layout) {
  const road = roadFrom(layout);
  return road.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - road[i][0], p[1] - road[i][1]), 0);
}
