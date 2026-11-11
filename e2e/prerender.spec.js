// @ts-check
import { expect, test } from '@playwright/test';

const SITE = 'https://www.allencodeco.com';

/** Every sitemap page, its own title and words from its own content (Phase 9). */
const PAGES = [
  { path: '/', title: 'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses', text: 'Welcome to Allen Code Co.' },
  { path: '/products', title: 'Products — Allen Code Co.', text: 'Live in the market, built to survive scrutiny.' },
  { path: '/products/my-teachers-toolbox', title: 'My Teachers Toolbox — Allen Code Co.', text: 'My Teachers Toolbox' },
  { path: '/products/underfire-ai', title: 'UnderFire AI — Allen Code Co.', text: 'UnderFire AI' },
  { path: '/products/founders-helm', title: 'Founders Helm — Allen Code Co.', text: 'Founders Helm' },
  { path: '/products/crew-advisors', title: 'Crew Advisors — Allen Code Co.', text: 'Crew Advisors' },
  { path: '/services', title: 'Services — Allen Code Co.', text: 'Custom work, scoped and priced upfront.' },
  { path: '/templates', title: 'Templates — Allen Code Co.', text: 'Evergreen' },
  { path: '/about', title: 'About — Allen Code Co.', text: 'Chris Allen' },
  { path: '/contact', title: 'Contact — Allen Code Co.', text: "Tell me what you're building." },
];

/** React's production errors for a page that does not hydrate as it was built, and its dev wording. */
const HYDRATION_ERROR = /Minified React error #(418|423|425)|hydrat|did not match/i;

test.describe('with JavaScript off, every page is its own prebuilt HTML', () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, title, text } of PAGES) {
    test(`${path} has its own head and content`, async ({ page }) => {
      await page.goto(path);
      const url = `${SITE}${path}`;
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}/og-image.png`);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
      expect(jsonLd['@type']).toBe('Organization');
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main')).toContainText(text);
      await expect(page.locator('noscript main')).toHaveCount(0);
    });
  }
});

test.describe('with JavaScript on, the browser takes over without a mismatch', () => {
  const ADDRESSES = [...PAGES.map((p) => p.path), '/nope', '/products/not-a-product', '/checkout-success?session_id=x'];

  for (const address of ADDRESSES) {
    test(`${address} hydrates or renders with no error`, async ({ page }) => {
      /** @type {string[]} */
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(address);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main h1')).toHaveCount(1);
      expect(errors.filter((text) => HYDRATION_ERROR.test(text))).toEqual([]);
    });
  }
});

test('an address with no page gets the shell, never the prebuilt home, and shows the 404 page', async ({ page, request }) => {
  const body = await (await request.get('/nope')).text();
  expect(body).toContain('<div id="root"></div>');
  expect(body).not.toContain('Welcome to Allen Code Co.');
  await page.goto('/nope');
  await expect(page.getByRole('heading', { level: 1, name: 'Nothing to see here.' })).toBeVisible();
  await expect(page).toHaveTitle('Page not found — Allen Code Co.');
});

test('a prebuilt page arrives with its content, and its old addresses redirect to the clean one', async ({ request }) => {
  const about = await request.get('/about');
  expect(about.status()).toBe(200);
  expect(await about.text()).toContain('<title>About — Allen Code Co.</title>');
  for (const old of ['/about/', '/about.html']) {
    const response = await request.get(old, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('/about');
  }
});
