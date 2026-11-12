// @ts-check
import { expect, test } from '@playwright/test';

/** Code World W1.3: the engine on the home page behind `/?world=1`. */

/** @param {import('@playwright/test').Page} page @param {number} progress */
async function scrollJourney(page, progress) {
  // The journey comes in its own chunk (W2.5): the canvas can be ready a moment before it is.
  await page.locator('[data-world-journey]').waitFor();
  await page.evaluate((p) => {
    const journey = /** @type {HTMLElement} */ (document.querySelector('[data-world-journey]'));
    const top = journey.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (journey.offsetHeight - window.innerHeight) * p);
  }, progress);
}

/**
 * The middle of the fork's stop (0..1), as the page marks it.
 * @param {import('@playwright/test').Page} page
 */
async function forkMiddle(page) {
  return page.evaluate(() => {
    const fork = /** @type {HTMLElement} */ (document.querySelector('[data-stop-id="the-fork"]'));
    return (Number(fork.dataset.from) + Number(fork.dataset.to)) / 2;
  });
}

test('without the switch the home page is today’s: no world, and its prebuilt HTML knows nothing of it', async ({ page, request }) => {
  const body = await (await request.get('/')).text();
  expect(body).not.toContain('data-world');
  await page.goto('/');
  await expect(page.locator('[data-chapter="gate"]')).toHaveCount(1);
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
});

test('with ?world=1 the home page is the journey: one world canvas, the approved words, the stops as it scrolls', async ({ page }) => {
  await page.goto('/?world=1');
  await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByText('It all starts with an empty file…')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Welcome to Allen Code Co\..*What would you like.*to build today\?/);
  await expect(page.locator('[data-chapter="gate"]')).toHaveCount(0);
  for (const [progress, name] of /** @type {Array<[number, string]>} */ ([
    [0, 'Empty file'],
    [0.55, 'Into the code'],
    [0.82, 'The road'],
    [0.98, 'The fork'],
  ])) {
    await scrollJourney(page, progress);
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', name);
  }
});

test('the switch lasts the session: inner pages keep the code field, and the home page stays the journey', async ({ page }) => {
  await page.goto('/?world=1');
  await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
  await expect(page.locator('canvas[data-field="webgl"], [data-field="css"]').first()).toBeAttached();
  await page.goBack();
  await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
  await page.goto('/?world=0');
  await expect(page.locator('[data-chapter="gate"]')).toHaveCount(1);
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
});

test('with reduced motion the switch changes nothing: today’s home page, no world', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?world=1');
  await expect(page.locator('[data-chapter="gate"]')).toHaveCount(1);
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
});

test.describe('taking a road at the split (Code World W1.4)', () => {
  /** @param {import('@playwright/test').Page} page */
  async function atTheFork(page) {
    await page.goto('/?world=1');
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await scrollJourney(page, 1);
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  }
  /** @param {import('@playwright/test').Page} page @param {number} dx @param {number} dy */
  async function drag(page, dx, dy) {
    const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 };
    const x = width / 2;
    const y = height / 3;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
    await page.mouse.move(x + dx, y + dy, { steps: 4 });
    await page.mouse.up();
  }

  test('before a road is taken the journey ends at the split, with no door’s chapters below', async ({ page }) => {
    await atTheFork(page);
    await expect(page.locator('[data-chapter="mvp-sprints"], [data-door-b-intro], [data-stop-id="my-teachers-toolbox"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /business\// })).toBeVisible();
    await expect(page.getByRole('button', { name: /family\// })).toBeVisible();
  });

  test('clicking the business/ signpost takes the business road and the journey runs down it', async ({ page }) => {
    await atTheFork(page);
    await page.getByRole('button', { name: /business\// }).click();
    // In the world the business road carries door A's chapters (W2.5): its first stop is there.
    await expect(page.locator('[data-stop-id="my-teachers-toolbox"]')).toBeAttached();
    await expect.poll(() => page.locator('[data-active-stop]').getAttribute('data-active-stop'), { timeout: 8000 }).toBe('business/');
  });

  test('→ takes the family road', async ({ page }) => {
    await atTheFork(page);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-door-b-intro]')).toBeAttached();
  });

  test('dragging left takes business/; a short drag or an up-and-down one takes nothing', async ({ page }) => {
    await atTheFork(page);
    await drag(page, 30, 0);
    await drag(page, 10, -160);
    await expect(page.locator('[data-chapter="mvp-sprints"], [data-door-b-intro], [data-stop-id="my-teachers-toolbox"]')).toHaveCount(0);
    await drag(page, -120, 6);
    // In the world the business road carries door A's chapters (W2.5): its first stop is there.
    await expect(page.locator('[data-stop-id="my-teachers-toolbox"]')).toBeAttached();
  });

  test('back at the split the other road can be taken', async ({ page }) => {
    await atTheFork(page);
    await page.getByRole('button', { name: /business\// }).click();
    // In the world the business road carries door A's chapters (W2.5): its first stop is there.
    await expect(page.locator('[data-stop-id="my-teachers-toolbox"]')).toBeAttached();
    await expect.poll(() => page.locator('[data-active-stop]').getAttribute('data-active-stop'), { timeout: 8000 }).toBe('business/');
    // The road stop comes on mid-glide. A visitor's own scroll goes through Lenis and takes over
    // from the glide; the direct scrollTo below does not, so wait for Lenis's glide to end first.
    await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
    await page.evaluate(() => {
      const j = /** @type {HTMLElement} */ (document.querySelector('[data-world-journey]'));
      const top = j.getBoundingClientRect().top + window.scrollY;
      // The middle of the fork's own stop, as the page marks it (its place moves as roads grow).
      const fork = /** @type {HTMLElement} */ (document.querySelector('[data-stop-id="the-fork"]'));
      const middle = (Number(fork.dataset.from) + Number(fork.dataset.to)) / 2;
      window.scrollTo(0, top + (j.offsetHeight - window.innerHeight) * middle);
    });
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
    await expect(page.getByRole('button', { name: /business\// })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /family\// }).click();
    await expect(page.locator('[data-door-b-intro]')).toBeAttached();
  });

  test('back at the split, choosing the road already taken runs down it again', async ({ page }) => {
    await atTheFork(page);
    await page.getByRole('button', { name: /business\// }).click();
    await expect.poll(() => page.locator('[data-active-stop]').getAttribute('data-active-stop'), { timeout: 8000 }).toBe('business/');
    await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
    await scrollJourney(page, await forkMiddle(page));
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
    await page.getByRole('button', { name: /business\// }).click();
    await expect.poll(() => page.locator('[data-active-stop]').getAttribute('data-active-stop'), { timeout: 8000 }).toBe('business/');
  });

  test('at the split the screen under a finger keeps sideways swipes for the page', async ({ page }) => {
    await atTheFork(page);
    const touchAction = await page.evaluate(() => {
      const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3);
      return hit ? getComputedStyle(/** @type {Element} */ (hit.closest('[data-world-journey]') ?? hit)).touchAction : null;
    });
    expect(touchAction).toBe('pan-y');
  });

  test('a returning visitor with a road stored starts at the empty file, with that road ahead', async ({ page }) => {
    await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
    await page.goto('/?world=1');
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'Empty file');
    await expect(page.locator('[data-world-journey] h2', { hasText: 'business/' })).toBeAttached();
  });
});
