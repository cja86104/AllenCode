// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openWithDoor } from './door.js';

/** @param {import('@playwright/test').Page} page */
async function seriousViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
}

for (const path of ['/', '/products', '/services', '/templates', '/about', '/contact']) {
  test(`no serious or critical accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeAttached();
    await page.waitForTimeout(1200);
    expect(await seriousViolations(page)).toEqual([]);
  });
}

for (const door of /** @type {const} */ (['a', 'b'])) {
  test(`no serious or critical accessibility violations on / with door ${door} open`, async ({ page }) => {
    await openWithDoor(page, door);
    await expect(page.locator('[data-chapter="brief"]')).toBeAttached();
    await page.waitForTimeout(1200);
    expect(await seriousViolations(page)).toEqual([]);
  });
}
