// @ts-check
import { expect } from '@playwright/test';

/** Shared steps for the Code World's browser tests (`worldbusiness`, `worldfamily`). */

/** @param {import('@playwright/test').Page} page */
export const canvas = (page) => page.locator('canvas[data-world]');

/** @param {import('@playwright/test').Page} page */
export async function open(page) {
  await page.goto('/?world=1');
  await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
  await page.locator('[data-world-journey]').waitFor();
}

/** Scrolls to `y` and waits for the canvas to have drawn there. @param {import('@playwright/test').Page} page @param {number} y */
export async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(y - 3);
  await page.waitForTimeout(250);
}

/** The scroll span a section's frame is pinned for (from its top until its last screen). @param {import('@playwright/test').Page} page @param {string} selector */
export async function spanOf(page, selector) {
  return page.evaluate((sel) => {
    const el = /** @type {HTMLElement} */ (document.querySelector(sel));
    const rect = el.getBoundingClientRect();
    const from = rect.top + window.scrollY;
    return { from, to: from + rect.height - window.innerHeight };
  }, selector);
}

/** Scrolls to a share (0..1) of a road chapter's pinned span. @param {import('@playwright/test').Page} page @param {string} id @param {number} share */
export async function inChapter(page, id, share) {
  const span = await spanOf(page, `[data-world-stop="${id}"]`);
  await scrollTo(page, span.from + (span.to - span.from) * share);
}

/** Takes business/ at the fork and waits for the glide to end. @param {import('@playwright/test').Page} page */
export async function takeBusiness(page) {
  const journey = await spanOf(page, '[data-world-journey]');
  await scrollTo(page, journey.to);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  await page.getByRole('button', { name: /business\// }).click();
  await expect(canvas(page)).toHaveAttribute('data-road', 'a');
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
}

/** The canvas's box for the resting landmark, in CSS pixels. @param {import('@playwright/test').Page} page */
export async function restRect(page) {
  const value = await canvas(page).getAttribute('data-rest-rect');
  if (!value) throw new Error('no rest rect');
  const [left, top, width, height] = value.split(',').map(Number);
  return { left, top, width, height };
}

/** Whether a box lies within 3 % (of the rect's size) of the rect. */
export function near(/** @type {{ x: number, y: number, width: number, height: number }} */ box, /** @type {{ left: number, top: number, width: number, height: number }} */ rect) {
  const dx = 0.03 * rect.width;
  const dy = 0.03 * rect.height;
  return Math.abs(box.x - rect.left) <= dx && Math.abs(box.y - rect.top) <= dy && Math.abs(box.width - rect.width) <= dx && Math.abs(box.height - rect.height) <= dy;
}

/** Takes templates/custom/ (door B's road) at the fork and waits for the glide to end. @param {import('@playwright/test').Page} page */
export async function takeFamily(page) {
  const journey = await spanOf(page, '[data-world-journey]');
  await scrollTo(page, journey.to);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  await page.getByRole('button', { name: /templates\/custom\// }).click();
  await expect(canvas(page)).toHaveAttribute('data-road', 'b');
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
}
