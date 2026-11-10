// @ts-check
import { expect, test } from '@playwright/test';

const SITE = 'https://www.allencodeco.com';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('with JavaScript disabled the static shell still has the title, description and canonical', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Allen Code Co\./);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Custom development/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}/og-image.png`);
    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(jsonLd['@type']).toBe('Organization');
  });

  test('a reader without JavaScript still gets what the studio is and a link to every page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Allen Code Co.' })).toBeVisible();
    for (const path of ['/products', '/services', '/templates', '/about', '/contact']) {
      await expect(page.locator(`noscript a[href="${path}"], main a[href="${path}"]`).first()).toBeAttached();
    }
  });
});

const PAGES = [
  { path: '/', title: /Allen Code Co\. — Custom Software/ },
  { path: '/products', title: /^Products — Allen Code Co\.$/ },
  { path: '/products/underfire-ai', title: /^UnderFire AI — Allen Code Co\.$/ },
  { path: '/services', title: /^Services — Allen Code Co\.$/ },
  { path: '/templates', title: /^Templates — Allen Code Co\.$/ },
  { path: '/about', title: /^About — Allen Code Co\.$/ },
  { path: '/contact', title: /^Contact — Allen Code Co\.$/ },
];

for (const { path, title } of PAGES) {
  test(`${path} has its own title, description and canonical, and is indexable`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path === '/' ? '/' : path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    await expect(page.locator('main h1')).toHaveCount(1);
  });
}

test('robots.txt and the sitemap list the public pages', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/', '/products', '/services', '/templates', '/about', '/contact']) {
    expect(sitemap).toContain(`<loc>${SITE}${path}</loc>`);
  }
});
