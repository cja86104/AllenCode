// @ts-check
import { expect, test } from '@playwright/test';
import { canvas, open, scrollTo, spanOf, takeBusiness } from './world.js';

/**
 * The hollow mist (Chris, 2026-11-17: "i want to do hollow mist"): a cool mist lying on the low ground
 * of the home's roads, faded in with the world's own file, so the gate stays clean. Measured from the
 * screen's pixels: the mist is the only thing there that is blue more than red.
 */

/**
 * How much cool mist is in a band of the screen: the mean of blue minus red over its pixels.
 * @param {Buffer} buffer @param {number} fromY @param {number} toY Shares of the height.
 */
async function coolness(buffer, fromY, toY) {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(buffer);
  let sum = 0;
  let count = 0;
  for (let y = Math.floor(png.height * fromY); y < Math.floor(png.height * toY); y += 2) {
    for (let x = 0; x < png.width; x += 2) {
      const i = (y * png.width + x) * 4;
      sum += png.data[i + 2] - png.data[i];
      count += 1;
    }
  }
  return sum / count;
}

test.describe('the hollow mist', () => {
  test('lies over the road’s low ground and along the horizon: the screen turns cool where it is', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    const a = await spanOf(page, '[data-world-stop="mvp-sprints"]');
    const b = await spanOf(page, '[data-world-stop="custom-saas-builds"]');
    await scrollTo(page, a.to + (b.from - a.to) * 0.6);
    await page.waitForTimeout(300);
    // The middle of the screen, where the horizon and the low ground ahead are.
    expect(await coolness(await page.screenshot(), 0.3, 0.7)).toBeGreaterThan(3);
  });

  test('keeps the gate clean: no mist before the world’s own file shows', async ({ page }) => {
    await open(page);
    await expect(canvas(page)).toHaveAttribute('data-editor', '0.00');
    await page.waitForTimeout(300);
    expect(await coolness(await page.screenshot(), 0.3, 0.7)).toBeLessThan(0.5);
  });
});
