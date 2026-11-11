// @ts-check
import { expect, test } from '@playwright/test';
import { openWithDoor } from './door.js';

/**
 * Door B's opening and the builder read at the same size as the other chapters (chapterType.js;
 * Chris, 2026-11-10: "both of these did not get the enlargement"), and their words still fit inside
 * the pinned frame on every common desktop screen.
 */
const SCREENS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

const CHAPTERS = [
  { name: "door B's opening", door: /** @type {const} */ ('b'), section: '[data-door-b-intro]' },
  { name: 'the builder', door: /** @type {const} */ ('b'), section: '[data-chapter="builder"]' },
];

for (const chapter of CHAPTERS) {
  for (const screen of SCREENS) {
    test(`${chapter.name} at ${screen.width} x ${screen.height}: chapter-size words, inside the pinned frame`, async ({ page }) => {
      await page.setViewportSize(screen);
      await openWithDoor(page, chapter.door);
      const section = page.locator(chapter.section);
      await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
      }, chapter.section);
      await expect(section.locator('h2')).toBeVisible();
      // The pinned frame is laid out from the measured window once the page has hydrated.
      await page.waitForLoadState('networkidle');
      const m = await section.evaluate((el) => {
        const title = /** @type {HTMLElement} */ (el.querySelector('h2'));
        const box = /** @type {HTMLElement} */ (title.parentElement).getBoundingClientRect();
        return { titlePx: parseFloat(getComputedStyle(title).fontSize), top: box.top, bottom: box.bottom, frame: window.innerHeight };
      });
      // The chapter title size from chapterType.js at this screen: clamp(48px, min(4.2vw, 7.5vh), 76px).
      const expected = Math.min(76, Math.max(48, Math.min(0.042 * screen.width, 0.075 * screen.height)));
      expect(m.titlePx).toBeCloseTo(expected, 0);
      expect(m.top).toBeGreaterThanOrEqual(0);
      expect(m.bottom).toBeLessThanOrEqual(m.frame);
    });
  }
}
