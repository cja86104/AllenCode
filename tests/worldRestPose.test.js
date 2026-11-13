// @ts-check
import { describe, expect, it } from 'vitest';
import { restPose } from '../src/world/restPose.js';
import { landmarkRect } from '../src/world/landmark.js';
import { flightGeometry } from '../src/scenes/flight.jsx';
import { getExcerpt } from '../src/content/excerpts/index.js';
import { serviceScreens } from '../src/data/serviceScreens.js';

/** @typedef {[number, number, number]} Vec3 */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
];

const underfire = /** @type {NonNullable<ReturnType<typeof getExcerpt>>} */ (getExcerpt('product-underfire-ai'));
const mvp = /** @type {NonNullable<ReturnType<typeof getExcerpt>>} */ (getExcerpt('service-mvp'));

/**
 * @param {{ center: Vec3, facing: Vec3, width: number, height: number }} landmark
 * @param {{ x: number, y: number, w: number, h: number }} box
 * @param {{ width: number, height: number }} viewport
 */
function expectOnBox(landmark, box, viewport) {
  const rect = landmarkRect(restPose(landmark, box, viewport), viewport, landmark);
  expect(rect.visible).toBe(true);
  expect(Math.abs(rect.left - box.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.top - box.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.width - box.w)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.height - box.h)).toBeLessThanOrEqual(1);
}

describe('restPose: the camera that puts a landmark on its chapter’s screen box (Code World R1)', () => {
  it('lands UnderFire AI’s landmark on its loop’s box and MVP Sprints’ on its screen’s, desktop and phone', () => {
    for (const viewport of VIEWPORTS) {
      const loopBox = flightGeometry(underfire.code, { width: 1280, height: 800 }, viewport.width, viewport.height).targetBox;
      expectOnBox({ center: [-12.6, 2.9, -59.8], facing: [0.394, 0, 0.919], width: 6, height: 3.75 }, loopBox, viewport);
      const screen = serviceScreens['mvp-sprints'];
      if (!screen) throw new Error('MVP Sprints has no screen');
      const screenBox = flightGeometry(mvp.code, screen, viewport.width, viewport.height).targetBox;
      const height = (6 * screen.height) / screen.width;
      expectOnBox({ center: [3, 2.5, -80], facing: [0.394, 0, 0.919], width: 6, height }, screenBox, viewport);
    }
  });

  it('works for a landmark facing any way on the ground', () => {
    const viewport = VIEWPORTS[0];
    const box = { x: 700, y: 180, w: 640, h: 400 };
    expectOnBox({ center: [10, 2, 0], facing: [1, 0, 0], width: 6, height: 3.75 }, box, viewport);
    expectOnBox({ center: [0, 2, 10], facing: [0, 0, -1], width: 6, height: 3.75 }, box, viewport);
  });

  it('looks square on: from eye to target is straight back along the facing, level', () => {
    const pose = restPose({ center: [0, 2, 0], facing: [0.6, 0, 0.8], width: 6 }, { x: 600, y: 200, w: 500, h: 312 }, VIEWPORTS[0]);
    const d = [pose.eye[0] - pose.target[0], pose.eye[1] - pose.target[1], pose.eye[2] - pose.target[2]];
    const length = Math.hypot(d[0], d[1], d[2]);
    expect(d[0] / length).toBeCloseTo(0.6, 9);
    expect(d[1] / length).toBeCloseTo(0, 9);
    expect(d[2] / length).toBeCloseTo(0.8, 9);
    expect(pose.fov).toBe(52);
  });
});
