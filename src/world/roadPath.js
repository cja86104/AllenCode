// @ts-check

/**
 * Walking a road's centre line (Code World W4): the road bends where the roads meet, so a place on it
 * is found by its distance along it, not by one straight heading.
 */

/** @typedef {[number, number]} Point2 A point on the ground: x and z. */
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
 * road is no longer one straight line). Before its start and past its end it carries straight on.
 * @param {RoadLike} layout
 * @param {number} distance
 * @returns {{ point: Point2, heading: Point2 }}
 */
export function roadAt(layout, distance) {
  const road = roadFrom(layout);
  let walked = 0;
  for (let i = 0; i < road.length - 1; i += 1) {
    const [ax, az] = road[i];
    const [bx, bz] = road[i + 1];
    const length = Math.hypot(bx - ax, bz - az);
    const heading = /** @type {Point2} */ ([(bx - ax) / length, (bz - az) / length]);
    if (distance < walked + length || i === road.length - 2) {
      const t = distance - walked;
      return { point: [ax + heading[0] * t, az + heading[1] * t], heading };
    }
    walked += length;
  }
  return { point: [road[0][0], road[0][1]], heading: [0, -1] };
}

/**
 * How far along the road (from the branch's end) a point on the ground lies: the distance to its
 * nearest point on the road; before the road's start or past its end, along its first or last heading.
 * @param {RoadLike} layout
 * @param {ReadonlyArray<number>} p
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
 * The road's centre line between two distances along it.
 * @param {RoadLike} layout @param {number} from @param {number} to
 * @returns {Point2[]}
 */
export function roadBetween(layout, from, to) {
  const road = roadFrom(layout);
  /** @type {Point2[]} */
  const points = [roadAt(layout, from).point];
  let walked = 0;
  for (let i = 0; i < road.length - 1; i += 1) {
    walked += Math.hypot(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1]);
    if (walked > from && walked < to) points.push([road[i + 1][0], road[i + 1][1]]);
  }
  points.push(roadAt(layout, to).point);
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
