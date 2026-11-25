import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/', '/menu', '/about', '/gallery', '/reservations', '/contact', '/no-such-page'];

/** The demonstration's stock photographs live on Unsplash; the tests never depend on reaching it. */
const STOCK_HOST = 'images.unsplash.com';
const STAND_IN_PHOTO =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3" viewBox="0 0 4 3"><rect width="4" height="3" fill="#3c0f18"/></svg>';

test.beforeEach(async ({ page }) => {
  await page.route(`https://${STOCK_HOST}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: STAND_IN_PHOTO }),
  );
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

/** The next date (from tomorrow on) that falls on `weekday` (0 = Sunday), as `yyyy-mm-dd` in local time. */
function nextWeekday(weekday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() !== weekday) date.setDate(date.getDate() + 1);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The table-booking form (the private event form on the same page has fields with similar names). */
function reservationForm(page: Page) {
  return page.locator('form', { has: page.getByRole('heading', { name: 'Reserve a table' }) });
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

  test('the reservation form’s error state has no violations', async ({ page }) => {
    await page.goto('/reservations');
    const form = reservationForm(page);
    await form.getByRole('button', { name: 'Request reservation' }).click();
    await expect(form.getByRole('alert')).toHaveText('3 things need a look before booking.');
    await expect(form.getByLabel('Date', { exact: true })).toBeFocused();
    await expectNoViolations(page);
  });
});

test.describe('reservations', () => {
  test('closed days say so, open days offer the kitchen’s times, and the demonstration sends nothing', async ({ page }) => {
    await page.goto('/reservations');
    const form = reservationForm(page);
    const date = form.getByLabel('Date', { exact: true });

    await date.fill(nextWeekday(1));
    await expect(form.getByText('We’re closed on Mondays. Please choose another day.')).toBeVisible();

    await date.fill(nextWeekday(2));
    const times = form.getByRole('group', { name: 'Time' }).getByRole('radio');
    // Tuesday: 5:30pm to 9:30pm, last seating an hour before close, every 30 minutes.
    await expect(times).toHaveCount(7);
    await times.first().check({ force: true });

    await form.getByRole('button', { name: 'More guests' }).click();
    await expect(form.getByRole('status')).toHaveText('3 guests');

    await form.getByLabel('Name', { exact: true }).fill('Jordan Lee');
    await form.getByLabel('Email', { exact: true }).fill('jordan@example.com');
    await form.getByRole('button', { name: 'Request reservation' }).click();

    const heading = page.getByRole('heading', { name: 'Nothing was sent.' });
    await expect(heading).toBeFocused();
    await expect(page.getByText(/Request received, Jordan\. A table for 3 on/)).toBeVisible();
    await expectNoViolations(page);

    await page.getByRole('button', { name: 'Back to the form' }).click();
    await expect(reservationForm(page).getByLabel('Name', { exact: true })).toHaveValue('Jordan Lee');
  });
});

test.describe('keyboard', () => {
  test('the skip link is the first stop and moves to the content', async ({ page }) => {
    await page.goto('/menu');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('the menu tabs move with the arrow keys, Home and End', async ({ page }) => {
    await page.goto('/menu');
    const tabs = page.getByRole('tablist', { name: 'Menu sections' });
    const starters = tabs.getByRole('tab', { name: 'Starters' });
    await expect(starters).toHaveAttribute('aria-selected', 'true');
    await starters.focus();

    await page.keyboard.press('ArrowRight');
    const mains = tabs.getByRole('tab', { name: 'Mains' });
    await expect(mains).toBeFocused();
    await expect(mains).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: 'Mains' })).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: 'Starters' })).toBeHidden();

    await page.keyboard.press('End');
    await expect(tabs.getByRole('tab', { name: 'Wine & Spirits' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(starters).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.getByRole('tab', { name: 'Wine & Spirits' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(starters).toBeFocused();
  });

  test('the signature dishes scroll with the Next button and with the keyboard', async ({ page }) => {
    await page.goto('/');
    const row = page.getByRole('region', { name: 'Signature Dishes, scrollable' });
    await row.scrollIntoViewIfNeeded();
    const left = () => row.evaluate((element) => element.scrollLeft);
    expect(await left()).toBe(0);

    await page.getByRole('button', { name: 'Next dishes' }).click();
    await expect.poll(left).toBeGreaterThan(0);

    await row.evaluate((element) => {
      element.scrollLeft = 0;
    });
    await row.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(left).toBeGreaterThan(0);
  });

  test('the press quotes stop rotating on Pause and when a quote is chosen', async ({ page }) => {
    await page.goto('/');
    const press = page.getByRole('group', { name: 'In the press' });
    await press.scrollIntoViewIfNeeded();
    await press.getByRole('button', { name: 'Pause' }).click();
    await expect(press.getByRole('button', { name: 'Play' })).toBeVisible();
    await page.mouse.move(0, 0);

    await press.getByRole('button', { name: 'Show the quote from Rhinebeck Ledger' }).click();
    await expect(press).toContainText('Rhinebeck Ledger');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(6500);
    await expect(press).toContainText('Rhinebeck Ledger');
  });

  test('the small-screen menu opens, closes with Escape, and keeps the links reachable', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu button appears on small screens only.');
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Reservations' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every page reads in full and the whole menu is shown', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rooted in the Land We Love');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Menu' })).toBeVisible();

    await page.goto('/menu');
    await expect(page.getByRole('tablist')).toBeHidden();
    for (const category of ['Starters', 'Mains', 'From the Garden', 'Desserts', 'Wine & Spirits']) {
      await expect(page.getByRole('heading', { level: 2, name: category })).toBeVisible();
    }
    await expect(page.getByText('Heirloom Beet Carpaccio')).toBeVisible();

    for (const [path, heading] of [
      ['/about', 'A Table Set by the Seasons'],
      ['/gallery', 'Gallery'],
      ['/reservations', 'Reservations'],
      ['/contact', 'Contact'],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    }
  });
});

test.describe('photographs', () => {
  test('a photograph that cannot load is replaced by its description', async ({ page }) => {
    await page.unroute(`https://${STOCK_HOST}/**`);
    await page.route(`https://${STOCK_HOST}/**`, (route) => route.abort());
    await page.goto('/');
    // The hero photograph loads first, so its failure shows at once; the panel keeps the description.
    const hero = page.getByRole('img', { name: 'A candlelit dining room set for the evening' });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveJSProperty('tagName', 'DIV');
  });
});

test.describe('hosting and search engines', () => {
  test('the demonstration asks not to be indexed, and each page has its own title and the restaurant data', async ({ page }) => {
    for (const [path, title] of [
      ['/', 'The Copper Thistle · Hudson Valley'],
      ['/menu', 'Menu · The Copper Thistle'],
      ['/reservations', 'Reservations · The Copper Thistle'],
    ] as const) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain('"@type":"Restaurant"');
    }
  });

  test('an unknown address answers 404 with the not-found page', async ({ page }) => {
    const response = await page.request.get('/no-such-page');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('This page isn’t on the menu.');
  });

  test('requests go only to the site itself and the stock photographs', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (request) => hosts.add(new URL(request.url()).host));
    for (const path of PAGES) await page.goto(path, { waitUntil: 'networkidle' });
    expect([...hosts].filter((host) => host !== 'localhost:4174' && host !== STOCK_HOST)).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('turns off smooth scrolling and the quote rotation', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    const press = page.getByRole('group', { name: 'In the press' });
    await expect(press.getByRole('button', { name: 'Pause' })).toHaveCount(0);
    await expect(press.getByRole('button', { name: 'Play' })).toHaveCount(0);
  });
});
