// @ts-check
import { expect, test } from '@playwright/test';

/** Every sitemap page (Phase 9). */
const PATHS = [
  '/',
  '/products',
  '/products/my-teachers-toolbox',
  '/products/underfire-ai',
  '/products/founders-helm',
  '/products/crew-advisors',
  '/services',
  '/templates',
  '/about',
  '/contact',
];

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

/**
 * Text inside `main` that a reader cannot see: an element with its own words that is, or sits inside,
 * something at opacity 0 or visibility hidden. Decoration marked aria-hidden is left out.
 * @param {import('@playwright/test').Page} page
 */
const hiddenText = (page) =>
  page.evaluate(() => {
    /** @type {string[]} */
    const found = [];
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const ownWords = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim());
      if (!ownWords) continue;
      for (let e = /** @type {Element | null} */ (el); e && e !== document.body; e = e.parentElement) {
        const style = getComputedStyle(e);
        if (style.opacity === '0' || style.visibility === 'hidden') {
          found.push(`${el.tagName.toLowerCase()}: ${(el.textContent ?? '').trim().slice(0, 50)}`);
          break;
        }
      }
    }
    return found;
  });

test.describe('with JavaScript off, every prebuilt page can be read', () => {
  test.use({ javaScriptEnabled: false });

  for (const size of SIZES) {
    for (const path of PATHS) {
      test(`${path} on a ${size.name}: no words left invisible, nothing wider than the screen`, async ({ page }) => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(path);
        expect(await hiddenText(page)).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`the home headline is on the first screen on a ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');
      const headline = page.locator('main h1');
      expect(await headline.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
      const box = await headline.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height);
    });
  }
});

/** @param {import('@playwright/test').Page} page */
const gateBoxes = (page) =>
  page.evaluate(() =>
    ['[data-editor-frame]', '[data-editor-code]', '[data-chapter="gate"] p'].map((selector) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`${selector} is missing`);
      const r = el.getBoundingClientRect();
      return { selector, x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );

for (const size of SIZES) {
  test(`on a ${size.name}, the gate is laid out for the screen before the scripts run, and stays put once they do`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    // The first paint on a slow connection: the prebuilt HTML and its stylesheet, no script yet.
    await page.route('**/assets/*.js', (route) => route.abort());
    await page.goto('/');
    const before = await gateBoxes(page);
    for (const box of before) {
      expect(box.x, `${box.selector} starts on screen`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w, `${box.selector} ends on screen`).toBeLessThanOrEqual(size.width);
    }

    await page.unroute('**/assets/*.js');
    await page.reload();
    await page.waitForLoadState('networkidle');
    const after = await gateBoxes(page);
    for (const [i, box] of after.entries()) {
      expect(Math.abs(box.x - before[i].x), `${box.selector} x`).toBeLessThanOrEqual(2);
      expect(Math.abs(box.y - before[i].y), `${box.selector} y`).toBeLessThanOrEqual(2);
      expect(Math.abs(box.w - before[i].w), `${box.selector} width`).toBeLessThanOrEqual(2);
    }
  });
}
