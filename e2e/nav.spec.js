// @ts-check
import { expect, test } from './plain.js';

/**
 * The primary action at every width (2026-11-26): in the full bar from 1280px, beside the menu button
 * from 640px to below 1280px, and in the menu on phones. Exactly one is shown in the bar at a time.
 */
for (const { width, inBar } of [
  { width: 375, inBar: false },
  { width: 768, inBar: true },
  { width: 1024, inBar: true },
  { width: 1280, inBar: true },
]) {
  test(`at ${width}px the primary action is ${inBar ? 'in the bar, once' : 'in the menu'}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/about');
    const header = page.locator('header');
    const shown = header.getByRole('link', { name: 'Start a Project' });
    await expect(shown).toHaveCount(inBar ? 1 : 0);
    if (inBar) {
      await expect(shown).toBeVisible();
      await expect(shown).toHaveAttribute('href', '/contact');
      // It fits: the bar holds the logo, the action and the menu button on one line.
      // The logo's row, not the path bar's row under it (Living Source Phase 3).
      const box = await header.locator(':scope > div:not([data-path-bar])').boundingBox();
      expect(box?.height ?? 0).toBeLessThan(80);
    } else {
      await header.getByRole('button', { name: 'Toggle menu' }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Start a Project' })).toBeVisible();
    }
  });
}
