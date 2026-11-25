import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/', '/beer', '/taproom', '/story', '/find-us', '/contact', '/no-such-page'];

/** The demonstration's stock photographs live on Unsplash; the tests never depend on reaching it. */
const STOCK_HOST = 'images.unsplash.com';
const STAND_IN_PHOTO =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3" viewBox="0 0 4 3"><rect width="4" height="3" fill="#0f2a32"/></svg>';

test.beforeEach(async ({ page }) => {
  await page.route(`https://${STOCK_HOST}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: STAND_IN_PHOTO }),
  );
  // Vercel serves the analytics script from the site's own /_vercel/insights address; the preview server has none.
  await page.route('**/_vercel/insights/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
});

/** Waits for every scroll-in reveal to finish fading in, so contrast is measured on the settled page. */
async function settle(page: Page) {
  await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every((element) => getComputedStyle(element).opacity === '1'));
}

async function expectNoViolations(page: Page) {
  await settle(page);
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

  for (const path of PAGES) {
    test(`${path} fits the screen without sideways scrolling`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()?.width);
    });
  }

  test('the small-screen menu opens, has no violations, and closes with Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu button shows only on small screens.');
    // Wait for the page to hydrate, so the button's handler is attached.
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Beer' })).toBeVisible();
    await expectNoViolations(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('the contact form’s error state and demonstration result have no violations', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expectNoViolations(page);
    await page.getByLabel('Name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByLabel('Message').fill('Do you host rehearsal dinners on the mezzanine?');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('heading', { name: 'Nothing was sent.' })).toBeFocused();
    await expectNoViolations(page);
  });

  test('the shop search narrows the list and announces the count', async ({ page }) => {
    await page.goto('/find-us', { waitUntil: 'networkidle' });
    await page.getByLabel('Search shops').fill('seaport');
    await expect(page.getByRole('status')).toHaveText('3 shops match “seaport”.');
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expectNoViolations(page);
  });

  test('the live board scrolls sideways from the keyboard', async ({ page }) => {
    await page.goto('/');
    const board = page.getByRole('region', { name: 'Beers on draft' });
    await board.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => board.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the home page reads in full', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('FoundingFathomsBrewing');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Beer' })).toBeVisible();
    for (const heading of ['Currently pouring', 'The Can Club', 'Brewed where the boats tie up'])
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(page.getByText(/I work the morning boats/)).toBeVisible();
  });

  test('the inner pages read in full, and the search that needs JavaScript is left out', async ({ page }) => {
    for (const [path, words] of [
      ['/beer', 'Autumn Plimsoll'],
      ['/taproom', 'Harbor Trivia Night'],
      ['/story', 'Mara Quinn · Head brewer'],
      ['/find-us', 'Railcar Craft Cellar'],
      ['/contact', 'Write us'],
    ] as const) {
      await page.goto(path);
      await expect(page.getByText(words).first()).toBeVisible();
    }
    await page.goto('/find-us');
    await expect(page.getByLabel('Search shops')).toBeHidden();
  });
});

test.describe('photographs', () => {
  test('a photograph that cannot load is replaced by its description', async ({ page }) => {
    await page.unroute(`https://${STOCK_HOST}/**`);
    await page.route(`https://${STOCK_HOST}/**`, (route) => route.abort());
    await page.goto('/');
    const hero = page.getByRole('img', { name: 'Stainless steel brewing tanks in a dim industrial brewhouse' });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveJSProperty('tagName', 'DIV');
  });
});

test.describe('hosting and search engines', () => {
  test('the demonstration asks not to be indexed and carries the brewery data', async ({ page }) => {
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toContain('<title>Founding Fathoms Brewing · Brewing · Harbor</title>');
    expect(html).toContain('"@type":"Brewery"');
  });

  test('an unknown address answers 404 with the not-found page', async ({ page }) => {
    const response = await page.request.get('/no-such-page');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Nothing on this tap.');
  });

  test('requests go only to the site itself and the stock photographs', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (request) => hosts.add(new URL(request.url()).host));
    for (const path of PAGES) await page.goto(path, { waitUntil: 'networkidle' });
    expect([...hosts].filter((host) => host !== 'localhost:4174' && host !== STOCK_HOST)).toEqual([]);
  });

  test('loads the analytics script from the site’s own address', async ({ page }) => {
    const analytics = page.waitForRequest((request) => new URL(request.url()).pathname === '/_vercel/insights/script.js');
    await page.goto('/');
    expect(new URL((await analytics).url()).host).toBe('localhost:4174');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('turns off smooth scrolling and the quote rotation', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    const quotes = page.getByRole('group', { name: 'From the regulars' });
    await expect(quotes.getByRole('button', { name: 'Pause' })).toHaveCount(0);
    await expect(quotes.getByRole('button', { name: 'Play' })).toHaveCount(0);
  });
});
