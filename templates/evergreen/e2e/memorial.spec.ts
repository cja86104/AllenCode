import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** The demonstration's stock photographs live on Unsplash; the tests never depend on reaching it. */
const STOCK_HOST = 'images.unsplash.com';
const STAND_IN_PHOTO =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3" viewBox="0 0 4 3"><rect width="4" height="3" fill="#6b7a5e"/></svg>';

test.beforeEach(async ({ page }) => {
  // Vercel serves its analytics script from the site's own /_vercel/insights/ on deployment only; a local
  // build has none, so the tests stand in an empty script instead of logging a missing file.
  await page.route('**/_vercel/insights/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await page.route(`https://${STOCK_HOST}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: STAND_IN_PHOTO }),
  );
});

const PAGES = [
  '/',
  '/story',
  '/photographs',
  '/photographs/porch-2019',
  '/share',
  '/privacy',
  '/family',
  '/family/preview',
  '/no-such-page',
];

async function expectNoViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  expect(
    results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

test.describe('accessibility', () => {
  for (const path of PAGES) {
    test(`${path} has no WCAG 2.2 AA violations and no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(path, { waitUntil: 'networkidle' });
      await expectNoViolations(page);
      expect(errors.filter((text) => !text.includes('404'))).toEqual([]);
    });
  }

  test('the form’s error state and the lightbox have no violations', async ({ page }) => {
    await page.goto('/share');
    await page.getByRole('button', { name: 'Try the form (nothing is sent)' }).click();
    await expect(page.getByRole('alert')).toBeFocused();
    await expectNoViolations(page);

    await page.goto('/photographs');
    await page.locator('[data-photo-link]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page);
  });
});

test.describe('keyboard', () => {
  test('the skip link is the first stop and moves to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('the lightbox opens from the keyboard, moves with arrows, and returns focus on Escape', async ({ page }) => {
    await page.goto('/photographs?show=family');
    await page.locator('[data-photo-link]').first().focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toContainText('2 of 5');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-photo-link="porch-steps-1982"]')).toBeFocused();
    await expect(page).toHaveURL(/\/photographs\?show=family$/);
  });

  test('the small-screen menu opens, closes with Escape, and keeps the links reachable', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu button appears on small screens only.');
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Gathering' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every page reads in full, the menu is visible, and stories open', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eleanor “Nell” Whitaker');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Memories' })).toBeVisible();
    await expect(page.getByText('Took place')).toBeVisible();
    await page.getByText('Read the story').first().click();
    await expect(page.locator('details').first()).toHaveAttribute('open', '');

    await page.goto('/story');
    await expect(page.getByText(/Mrs\. Lyda, let her take out six books/)).toBeVisible();

    await page.goto('/photographs');
    await page.locator('[data-photo-link]').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nell on the dirt road out to the feed store on Haywood Road.');
  });
});

test.describe('hosting and search engines', () => {
  test('an unlisted memorial asks not to be indexed on every page, and each page has its own title', async ({ page }) => {
    for (const [path, title] of [
      ['/', 'Eleanor “Nell” Whitaker, 1946–2026'],
      ['/story', 'Her life · Eleanor “Nell” Whitaker, 1946–2026'],
    ] as const) {
      const response = await page.request.get(path);
      const html = await response.text();
      expect(html).toContain('<meta name="robots" content="noindex, nofollow, noarchive" />');
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).not.toContain('og:image');
    }
  });

  test('an unknown address answers 404 with the not-found page', async ({ page }) => {
    const response = await page.request.get('/no-such-page');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('This page isn’t here.');
  });

  test('ships no analytics or third-party requests; only the demonstration photographs come from Unsplash', async ({ page }) => {
    const outside: string[] = [];
    page.on('request', (request) => {
      const { host } = new URL(request.url());
      if (host === 'localhost:4174') return;
      if (host === STOCK_HOST && request.resourceType() === 'image') return;
      outside.push(`${request.resourceType()} ${request.url()}`);
    });
    for (const path of PAGES) await page.goto(path, { waitUntil: 'networkidle' });
    expect(outside).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('turns off smooth scrolling and transitions', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    const button = page.getByRole('link', { name: 'Explore her life' });
    expect(await button.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  });
});
