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

test('/ draws a non-empty field', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas[data-field="webgl"]');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(300);
  expect(litPixels(await canvas.screenshot())).toBeGreaterThan(200);
});

test('scrolling through the gate moves the code toward the headline', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas[data-field="webgl"]');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  const section = page.locator('[data-chapter="gate"]');
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await section.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.38));
  await page.waitForTimeout(600);
  const before = await canvas.screenshot();
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.7));
  await page.waitForTimeout(900);
  const after = await canvas.screenshot();
  expect(differingPixels(before, after)).toBeGreaterThan(2000);
});

test('the real headline takes over, on screen, at the end of the gate', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const section = page.locator('[data-chapter="gate"]');
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await section.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span));
  const headline = section.getByRole('heading', { level: 1 });
  await expect(headline).toHaveCSS('opacity', '1');
  const box = await headline.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(800);
});
