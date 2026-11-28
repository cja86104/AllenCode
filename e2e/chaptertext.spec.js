// @ts-check
import { expect, test } from './plain.js';
import { openWithDoor } from './door.js';

/**
 * Door B's opening and the builder read at the same size as the other chapters (chapterType.js;
 * Chris, 2026-11-10: "both of these did not get the enlargement"), and their words still fit inside
 * the pinned frame on every common desktop screen. Immersive Web Experiences (2026-11-27), whose seven
 * scope items set in two columns, is checked on the two tightest screens that show them all, its words
 * also kept clear of the screen its code lands on; and on shorter screens (final review, 2026-11-27),
 * where its words take the compact form (no scope list; `wordsCompact`) and stay below the fixed
 * navigation (`NAV_FLOOR_PX`).
 */
const SCREENS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

/** @typedef {{ width: number, height: number, compact?: boolean }} Screen */
/** @type {Array<{ name: string, door: 'a' | 'b', section: string, screens?: Screen[] }>} */
const CHAPTERS = [
  { name: "door B's opening", door: 'b', section: '[data-door-b-intro]' },
  { name: 'the builder', door: 'b', section: '[data-chapter="builder"]' },
  {
    name: 'Immersive Web Experiences',
    door: 'a',
    section: '[data-chapter="immersive-web-experiences"]',
    screens: [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1024, height: 700, compact: true },
      { width: 1024, height: 640, compact: true },
      { width: 1024, height: 600, compact: true },
      { width: 1280, height: 600, compact: true },
      { width: 1280, height: 590, compact: true },
    ],
  },
];

for (const chapter of CHAPTERS) {
  for (const screen of /** @type {Screen[]} */ (chapter.screens ?? SCREENS)) {
    const form = screen.compact ? ' (compact)' : '';
    test(`${chapter.name} at ${screen.width} x ${screen.height}${form}: chapter-size words, inside the pinned frame`, async ({ page }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
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
        const target = el.querySelector('[data-world-target]')?.getBoundingClientRect();
        const items = el.querySelectorAll('li').length;
        const clear = !target || box.right <= target.left || target.right <= box.left || box.bottom <= target.top || target.bottom <= box.top;
        const nav = /** @type {HTMLElement} */ (document.querySelector('header')).getBoundingClientRect().bottom;
        const text = /** @type {HTMLElement} */ (title.parentElement).textContent ?? '';
        return { titlePx: parseFloat(getComputedStyle(title).fontSize), top: box.top, bottom: box.bottom, frame: window.innerHeight, items, clear, nav, text };
      });
      // The chapter title size from chapterType.js at this screen: clamp(48px, min(4.2vw, 7.5vh), 76px).
      const expected = Math.min(76, Math.max(48, Math.min(0.042 * screen.width, 0.075 * screen.height)));
      expect(m.titlePx).toBeCloseTo(expected, 0);
      expect(m.top).toBeGreaterThanOrEqual(0);
      expect(m.bottom).toBeLessThanOrEqual(m.frame);
      expect(m.clear, 'the words stay clear of the screen').toBe(true);
      if (chapter.door === 'a') {
        expect(m.top, 'the words stay below the fixed navigation').toBeGreaterThanOrEqual(m.nav);
        if (screen.compact) {
          expect(m.items, 'the compact form: no scope list (the full list stays on /services)').toBe(0);
          expect(m.text).toContain('Beyond websites. Into experiences.');
          expect(m.text).toContain('Timeline and deposit set per project, after scoping.');
        } else expect(m.items, 'every scope item shows').toBe(7);
      }
    });
  }
}

/**
 * A pinned service chapter's words rise only when they overflow the frame (`wordsRise`, 2026-11-27).
 * The five four-item chapters with a screen fit, so their words stay exactly where they were: at
 * 16 % of the frame, with no translation.
 */
const FOUR_ITEM_CHAPTERS = ['mvp-sprints', 'custom-saas-builds', 'custom-web-development', 'ui-ux-design', 'ai-integration'];

for (const screen of [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
]) {
  test(`the four-item service chapters' words do not move at ${screen.width} x ${screen.height}`, async ({ page }) => {
    await page.setViewportSize(screen);
    await openWithDoor(page, 'a');
    await page.waitForLoadState('networkidle');
    for (const slug of FOUR_ITEM_CHAPTERS) {
      const words = page.locator(`[data-chapter="${slug}"] [data-world-words]`);
      await words.waitFor({ state: 'attached' });
      const m = await words.evaluate((el) => ({ transform: getComputedStyle(el).transform, top: parseFloat(/** @type {HTMLElement} */ (el).style.top) }));
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)'], slug).toContain(m.transform);
      expect(m.top, slug).toBeCloseTo(0.16 * screen.height, 0);
    }
  });
}
