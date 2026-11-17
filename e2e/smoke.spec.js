// @ts-check
import { expect, test } from './plain.js';

test('home loads with the studio title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Allen Code Co/);
});
