// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Scrolls the page so the journey is at `progress` (0..1).
 * @param {import('@playwright/test').Page} page @param {number} progress
 */
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
 * A stop's places on the journey, as the page marks them (0..1).
 * @param {import('@playwright/test').Page} page @param {string} id
 * @returns {Promise<{ from: number, to: number, arrive: number | null, hold: number | null }>}
 */
async function stopAt(page, id) {
  return page.evaluate((stopId) => {
    const el = /** @type {HTMLElement} */ (document.querySelector(`[data-stop-id="${stopId}"]`));
    const num = (/** @type {string | undefined} */ v) => (v === undefined ? null : Number(v));
    return { from: Number(el.dataset.from), to: Number(el.dataset.to), arrive: num(el.dataset.arrive), hold: num(el.dataset.hold) };
  }, id);
}

/** Takes the business road at the split and waits for the glide to end. @param {import('@playwright/test').Page} page */
async function takeBusiness(page) {
  await page.goto('/?world=1');
  await page.locator('canvas[data-world][data-ready="true"]').waitFor();
  await scrollJourney(page, 1);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  await page.getByRole('button', { name: /business\// }).click();
  await expect(page.locator('canvas[data-world]')).toHaveAttribute('data-road', 'a');
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
}

/** Scrolls to a progress and waits for the canvas to have drawn it. @param {import('@playwright/test').Page} page @param {number} progress */
async function goTo(page, progress) {
  await scrollJourney(page, progress);
  await expect
    .poll(async () => Math.abs(Number(await page.locator('canvas[data-world]').getAttribute('data-progress')) - progress), { timeout: 5000 })
    .toBeLessThan(0.002);
}

const HANDING_OVER = ['my-teachers-toolbox', 'underfire-ai', 'founders-helm', 'mvp-sprints', 'custom-saas-builds', 'ai-integration', 'technical-audits'];

test.describe('the canvas draws the business road (Code World W2.4)', () => {
  test('each product and service hands over fully while the camera rests at it', async ({ page }) => {
    await takeBusiness(page);
    const canvas = page.locator('canvas[data-world]');
    for (const id of HANDING_OVER) {
      const stop = await stopAt(page, id);
      if (stop.arrive === null || stop.hold === null) throw new Error(`${id} has no rest`);
      await goTo(page, (stop.arrive + stop.hold) / 2);
      await expect(canvas).toHaveAttribute('data-handover-stop', id);
      await expect(canvas).toHaveAttribute('data-handover', '1.00');
    }
  });

  test('Crew Advisors types as the visitor scrolls, never past 0.65, and never hands over', async ({ page }) => {
    await takeBusiness(page);
    const canvas = page.locator('canvas[data-world]');
    const stop = await stopAt(page, 'crew-advisors');
    /** @type {number[]} */
    const typed = [];
    for (const t of [0.1, 0.5, 0.9]) {
      await goTo(page, stop.from + (stop.to - stop.from) * t);
      typed.push(Number(await canvas.getAttribute('data-typed')));
      expect(await canvas.getAttribute('data-handover-stop')).toBeNull();
    }
    expect(typed[1]).toBeGreaterThan(typed[0]);
    expect(typed[2]).toBeGreaterThan(typed[1]);
    expect(typed[2]).toBeLessThanOrEqual(0.65);
  });

  test('switching to family in the nav mid-road leaves the business road behind', async ({ page }) => {
    await takeBusiness(page);
    const canvas = page.locator('canvas[data-world]');
    const stop = await stopAt(page, 'underfire-ai');
    if (stop.arrive === null || stop.hold === null) throw new Error('no rest');
    await goTo(page, (stop.arrive + stop.hold) / 2);
    await expect(canvas).toHaveAttribute('data-handover-stop', 'underfire-ai');
    await page.getByRole('group', { name: 'Show the site for' }).first().getByRole('button', { name: 'Family' }).click();
    await expect(canvas).not.toHaveAttribute('data-road', 'a');
    await expect(canvas).not.toHaveAttribute('data-handover-stop', /.+/);
  });
});

const ROAD = [
  'my-teachers-toolbox',
  'underfire-ai',
  'founders-helm',
  'crew-advisors',
  'mvp-sprints',
  'custom-saas-builds',
  'ai-integration',
  'technical-audits',
  'how-i-work',
];
const PRODUCTS = ['my-teachers-toolbox', 'underfire-ai', 'founders-helm'];
const SERVICE_SCREENS = /** @type {const} */ ({
  'mvp-sprints': '/media/services/underfire-landing.jpg',
  'custom-saas-builds': '/media/services/founders-helm-dashboard.jpg',
  'ai-integration': '/media/services/openrouter-usage.jpg',
});

/** Scrolls to the middle of a stop's rest (or of the stop, if it has none). @param {import('@playwright/test').Page} page @param {string} id */
async function restAt(page, id) {
  const stop = await stopAt(page, id);
  const p = stop.arrive !== null && stop.hold !== null ? (stop.arrive + stop.hold) / 2 : (stop.from + stop.to) / 2;
  await goTo(page, p);
  return p;
}

/** The canvas's box for the landmark handing over, in CSS pixels. @param {import('@playwright/test').Page} page */
async function handoverRect(page) {
  const value = await page.locator('canvas[data-world]').getAttribute('data-handover-rect');
  if (!value) throw new Error('no handover rect');
  const [left, top, width, height] = value.split(',').map(Number);
  return { left, top, width, height };
}

/** Whether `box` lies within 3 % (of the rect's size) of `rect`. */
function near(/** @type {{ x: number, y: number, width: number, height: number }} */ box, /** @type {{ left: number, top: number, width: number, height: number }} */ rect) {
  const dx = 0.03 * rect.width;
  const dy = 0.03 * rect.height;
  return (
    Math.abs(box.x - rect.left) <= dx &&
    Math.abs(box.y - rect.top) <= dy &&
    Math.abs(box.width - rect.width) <= dx &&
    Math.abs(box.height - rect.height) <= dy
  );
}

test.describe('each stop’s words and its real thing (Code World W2.5)', () => {
  test('the road names every stop in order as the visitor reaches it', async ({ page }) => {
    await takeBusiness(page);
    const ids = await page.locator('[data-world-journey] [data-stop-id]').evaluateAll((els) => els.map((el) => /** @type {HTMLElement} */ (el).dataset.stopId));
    expect(ids.slice(-ROAD.length)).toEqual(ROAD);
    for (const id of ROAD) {
      await restAt(page, id);
      await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-stop-id', id);
    }
  });

  test('each product resolves into its real loop, laid over its sculpture, playing alone, linking to its page', async ({ page }) => {
    await takeBusiness(page);
    for (const slug of PRODUCTS) {
      await restAt(page, slug);
      const screen = page.locator(`[data-world-screen="${slug}"]`);
      await expect(screen).toBeVisible();
      const box = await screen.boundingBox();
      if (!box) throw new Error('no box');
      expect(near(box, await handoverRect(page)), `${slug} over its sculpture`).toBe(true);
      const video = screen.locator('video');
      await expect(video).toHaveAttribute('src', `/media/products/${slug}.mp4`);
      await expect.poll(() => video.evaluate((el) => !(/** @type {HTMLVideoElement} */ (el).paused) && /** @type {HTMLVideoElement} */ (el).currentTime > 0), { timeout: 8000 }).toBe(true);
      const others = await page.locator('video').evaluateAll((els, mine) => els.filter((el) => !el.closest(`[data-world-screen="${mine}"]`)).map((el) => /** @type {HTMLVideoElement} */ (el).paused), slug);
      expect(others.every(Boolean)).toBe(true);
      await expect(screen.getByRole('link')).toHaveAttribute('href', `/products/${slug}`);
    }
  });

  test('each service resolves into its real screen, and the audit into its file with every line checked', async ({ page }) => {
    await takeBusiness(page);
    for (const [slug, src] of Object.entries(SERVICE_SCREENS)) {
      await restAt(page, slug);
      const screen = page.locator(`[data-world-screen="${slug}"]`);
      await expect(screen).toBeVisible();
      await expect(screen.locator('img')).toHaveAttribute('src', src);
      const box = await screen.boundingBox();
      if (!box) throw new Error('no box');
      expect(near(box, await handoverRect(page)), `${slug} over its sculpture`).toBe(true);
    }
    await restAt(page, 'technical-audits');
    const audit = page.locator('[data-world-screen="technical-audits"]');
    await expect(audit).toBeVisible();
    const lines = audit.locator('[data-audit-line]');
    expect(await lines.count()).toBeGreaterThan(10);
    expect(await audit.locator('[data-audit-line]:not([data-checked="true"])').count()).toBe(0);
  });

  test('Crew Advisors never resolves: no real screen while it types', async ({ page }) => {
    await takeBusiness(page);
    await restAt(page, 'crew-advisors');
    await expect(page.locator('[data-world-screen]')).toHaveCount(0);
    await expect(page.locator('[data-active-stop]')).toContainText('Coming soon');
  });

  test('how I work marks each commit shipped as the camera passes it', async ({ page }) => {
    await takeBusiness(page);
    const stop = await stopAt(page, 'how-i-work');
    const panel = page.locator('[data-stop-id="how-i-work"]');
    const shipped = () => panel.locator('[data-shipped="true"]').count();
    await goTo(page, stop.from + 0.001);
    expect(await shipped()).toBe(0);
    /** @type {number[]} */
    const seen = [];
    for (let t = 0.05; t <= 1.0001; t += 0.05) {
      await goTo(page, Math.min(1, stop.from + (stop.to - stop.from) * t));
      const n = await shipped();
      if (seen[seen.length - 1] !== n) seen.push(n);
    }
    expect(seen).toEqual([0, 1, 2, 3].slice(seen[0]));
    expect(seen[seen.length - 1]).toBe(3);
  });

  test('every stop’s heading and words are in the page throughout, and the door chapters give way to the journey', async ({ page }) => {
    await takeBusiness(page);
    for (const name of ['My Teachers Toolbox', 'UnderFire AI', 'Founders Helm', 'Crew Advisors', 'MVP Sprints', 'Custom SaaS Builds', 'AI Integration & OpenRouter Routing', 'Technical Audits', 'How I work']) {
      await expect(page.locator('[data-world-journey]').getByRole('heading', { name, exact: true })).toHaveCount(1);
    }
    await expect(page.locator('[data-world-journey]')).toContainText('AI tools for K-5 teachers');
    await expect(page.locator('[data-product], [data-chapter="mvp-sprints"], [data-chapter="how-i-work"]')).toHaveCount(0);
    await expect(page.locator('[data-chapter="builder"], section:has-text("Read the full story")').first()).toBeAttached();
  });

  test('a jump straight to a stop shows only that stop’s real thing', async ({ page }) => {
    await takeBusiness(page);
    await restAt(page, 'founders-helm');
    await expect(page.locator('[data-world-screen]')).toHaveCount(1);
    await expect(page.locator('[data-world-screen="founders-helm"]')).toBeVisible();
    await restAt(page, 'mvp-sprints');
    await expect(page.locator('[data-world-screen]')).toHaveCount(1);
    await expect(page.locator('[data-world-screen="mvp-sprints"]')).toBeVisible();
  });

  test('turning the phone from desktop keeps the real screen over its sculpture, and the words clear of it', async ({ page }) => {
    await takeBusiness(page);
    const p = await restAt(page, 'underfire-ai');
    await page.setViewportSize({ width: 393, height: 852 });
    await goTo(page, p);
    const screen = page.locator('[data-world-screen="underfire-ai"]');
    await expect.poll(async () => {
      const box = await screen.boundingBox();
      return box ? near(box, await handoverRect(page)) : false;
    }).toBe(true);
  });

  test('on a phone, at every product and service, the words and the real screen do not overlap and the words fit', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await takeBusiness(page);
    for (const id of [...PRODUCTS, ...Object.keys(SERVICE_SCREENS)]) {
      await restAt(page, id);
      const screen = await page.locator(`[data-world-screen="${id}"]`).boundingBox();
      const words = await page.locator(`[data-stop-id="${id}"]`).boundingBox();
      if (!screen || !words) throw new Error(`no box for ${id}`);
      expect(words.y, `${id}: words below the screen`).toBeGreaterThanOrEqual(screen.y + screen.height);
      expect(words.y + words.height, `${id}: words on screen`).toBeLessThanOrEqual(852);
    }
  });

  test('on a desktop the words stand left of the real screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await takeBusiness(page);
    for (const id of [...PRODUCTS, ...Object.keys(SERVICE_SCREENS)]) {
      await restAt(page, id);
      const screen = await page.locator(`[data-world-screen="${id}"]`).boundingBox();
      const words = await page.locator(`[data-stop-id="${id}"]`).boundingBox();
      if (!screen || !words) throw new Error(`no box for ${id}`);
      expect(words.x + words.width, `${id}: words left of the screen`).toBeLessThanOrEqual(screen.x);
      expect(words.y + words.height).toBeLessThanOrEqual(900);
    }
  });
});

test('reduced motion with the switch and the business door: today’s chapters, no canvas, no world screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
  await page.goto('/?world=1');
  await expect(page.locator('[data-chapter="mvp-sprints"]')).toBeAttached();
  await expect(page.locator('[data-product="underfire-ai"]')).toBeAttached();
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
  await expect(page.locator('[data-world-screen]')).toHaveCount(0);
});

test('the journey has no accessibility violations at the fork, at a product and at how I work', async ({ page }) => {
  await page.goto('/?world=1');
  await page.locator('canvas[data-world][data-ready="true"]').waitFor();
  await scrollJourney(page, 1);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  const check = async () => {
    const results = await new AxeBuilder({ page }).include('[data-world-journey]').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  };
  await check();
  await page.getByRole('button', { name: /business\// }).click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
  await restAt(page, 'underfire-ai');
  await check();
  await restAt(page, 'how-i-work');
  await check();
});
