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
      // The remembered door applies just after the page hydrates, so the chapter may not exist yet.
      await section.waitFor({ state: 'attached' });
      // The pinned frame is laid out from the measured window once the page has hydrated.
      await page.waitForLoadState('networkidle');
      // Scroll to the chapter's top until it is there (the scroll engine can still be settling).
      await expect
        .poll(() =>
          section.evaluate((el) => {
            const top = el.getBoundingClientRect().top;
            if (Math.abs(top) > 2) window.scrollTo({ top: top + window.scrollY, behavior: 'instant' });
            return Math.abs(el.getBoundingClientRect().top) <= 2;
          }),
        )
        .toBe(true);
      await expect(section.locator('h2')).toBeVisible();
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
