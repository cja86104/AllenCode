// @ts-check
import { expect, test } from '@playwright/test';

test('home loads with the studio title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Allen Code Co/);
});
