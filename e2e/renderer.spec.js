// @ts-check
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

/**
 * Number of pixels brighter than a dim threshold in a PNG screenshot.
 * @param {Buffer} buffer
 */
function litPixels(buffer) {
  const png = PNG.sync.read(buffer);
  let lit = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 90) lit += 1;
  }
  return lit;
}

/**
 * Number of pixels that differ between two same-size PNG screenshots.
 * @param {Buffer} a
 * @param {Buffer} b
 */
function differingPixels(a, b) {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  let diff = 0;
  for (let i = 0; i < pa.data.length; i += 4) {
    if (Math.abs(pa.data[i] - pb.data[i]) + Math.abs(pa.data[i + 1] - pb.data[i + 1]) + Math.abs(pa.data[i + 2] - pb.data[i + 2]) > 30) diff += 1;
  }
  return diff;
}

test.use({ viewport: { width: 1280, height: 800 } });

test('/preview draws a non-empty field', async ({ page }) => {
  await page.goto('/preview');
  const canvas = page.locator('canvas[data-field="webgl"]');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(300);
  expect(litPixels(await canvas.screenshot())).toBeGreaterThan(200);
});

test('scrolling through the renderer check moves the code toward the headline', async ({ page }) => {
  await page.goto('/preview');
  const canvas = page.locator('canvas[data-field="webgl"]');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  const section = page.locator('[data-renderer-check]');
  await section.scrollIntoViewIfNeeded();
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(600);
  const before = await canvas.screenshot();
  const height = await section.evaluate((el) => el.getBoundingClientRect().height);
  await page.evaluate((y) => window.scrollTo(0, y), top + height * 0.45);
  await page.waitForTimeout(900);
  const after = await canvas.screenshot();
  expect(differingPixels(before, after)).toBeGreaterThan(2000);
});

test('the real headline takes over, on screen, at the end of the renderer check', async ({ page }) => {
  await page.goto('/preview');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const section = page.locator('[data-renderer-check]');
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await section.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span));
  const headline = section.locator('p[aria-hidden="true"]');
  await expect(headline).toHaveCSS('opacity', '1');
  const box = await headline.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(800);
});
