// @ts-check
import { expect, test } from '@playwright/test';
import { products } from '../src/data/products.js';
import { openWithDoor } from './door.js';

const HEADLINE = 'Welcome to Allen Code Co. What would you like to build today?';

test('/ renders the Source to Screen experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toHaveCount(1);
  await expect(page.getByText('It all starts with an empty file…')).toHaveCount(1);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: "I'm building a product or business" })).toBeVisible();
});

test('before a door is chosen the page ends at the fork', async ({ page }) => {
  await page.goto('/');
  // The home page loads on demand; read its chapters once it is there.
  await expect(page.locator('[data-chapter="gate"]')).toBeAttached();
  const chapters = await page.locator('[data-chapter]').evaluateAll((els) => els.map((el) => el.getAttribute('data-chapter')));
  expect(chapters).toEqual(['gate']);
  await expect(page.locator('[data-door-card]')).toHaveCount(2);
  await expect(page.getByLabel('Your idea', { exact: true })).toHaveCount(0);
});

test('opening a file flares the field, folds the other file away and glides into that door', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const fork = page.locator('[data-door-card="a"]');
  await fork.scrollIntoViewIfNeeded();
  await fork.click();
  await expect(fork).toHaveAttribute('data-opening', 'true');
  await expect(fork).toContainText('opening business/');
  await expect(page.locator('[data-door-card="b"]')).toHaveCount(0);
  const chapter = page.locator('[data-chapter="mvp-sprints"]');
  await expect
    .poll(async () => chapter.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 6000 })
    .toBeLessThanOrEqual(2);
  await expect(page.locator('[data-door-card]')).toHaveCount(2, { timeout: 6000 });
  await expect(page.locator('[data-door-card="a"]')).toHaveAttribute('aria-pressed', 'true');
});

test('/preview no longer exists', async ({ page }) => {
  await page.goto('/preview');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toHaveCount(0);
  await expect(page.getByText(/not found|404|doesn.t exist/i).first()).toBeVisible();
});

test('robots.txt no longer mentions /preview', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).not.toContain('/preview');
  expect(body).toContain('Allow: /');
});

const INNER_ROUTES = [
  '/products',
  ...products.map((product) => `/products/${product.slug}`),
  '/services',
  '/templates',
  '/about',
  '/contact',
  '/checkout-success',
];

for (const route of INNER_ROUTES) {
  test(`${route} still loads`, async ({ page }) => {
    /** @type {string[]} */
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/Allen Code Co/);
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('skip link is the first focusable element and moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('tab order never traps focus inside a pinned scene', async ({ page }) => {
  await openWithDoor(page, 'a');
  /** @type {string[]} */
  const visited = [];
  for (let i = 0; i < 160; i += 1) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return 'body';
      const chapter = el.closest('[data-chapter]');
      return `${chapter ? chapter.getAttribute('data-chapter') : el.closest('footer') ? 'footer' : el.closest('header') ? 'header' : 'other'}`;
    });
    visited.push(where);
    if (where === 'footer') break;
  }
  expect(visited).toContain('idea');
  expect(visited).toContain('brief');
  expect(visited.at(-1)).toBe('footer');
});

test('the idea typed into your-idea.txt becomes the first line of the brief', async ({ page }) => {
  await openWithDoor(page, 'a');
  const file = page.getByLabel('Your idea', { exact: true });
  await file.scrollIntoViewIfNeeded();
  await file.click();
  await page.keyboard.type('a booking site for my bakery');
  await expect(file).toHaveValue('a booking site for my bakery');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-sketch-blocks]')).toContainText('Booking calendar');
  await expect(page).toHaveURL(/[?&]idea=a(\+|%20)booking/);
  await expect(page.locator('#brief-message')).toHaveValue('a booking site for my bakery');
  await expect(file).toHaveValue('a booking site for my bakery');
});
