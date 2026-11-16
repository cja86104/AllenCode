// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { canvas, inChapter, near, open, restRect, scrollTo, spanOf, takeBusiness, takeFamily } from './world.js';

/**
 * Code World W4: whichever road was taken, it bends back and meets the other; on the shared road the
 * workshop (the builder chapter) and your idea (the idea chapter, held while it is on screen), then
 * the world fades out before the brief. The rail shows the journey from the empty file to shipped.
 */

/** The rail's current stop. @param {import('@playwright/test').Page} page */
const railHere = (page) => page.locator('nav[data-rail] [aria-current="step"]');

/** Scrolls so your idea's section sits where its hold is half way. @param {import('@playwright/test').Page} page */
async function atYourIdea(page) {
  const y = await page.evaluate(() => {
    const el = /** @type {HTMLElement} */ (document.querySelector('[data-world-stop="your-idea"]'));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    return (top - 0.25 * vh + (top + el.offsetHeight - 0.75 * vh)) / 2;
  });
  await scrollTo(page, y);
}

/** Scrolls to the brief. @param {import('@playwright/test').Page} page */
async function atTheBrief(page) {
  const y = await page.evaluate(() => {
    const el = /** @type {HTMLElement} */ (document.querySelector('[data-world-segment="end"]'));
    return el.getBoundingClientRect().top + window.scrollY;
  });
  await scrollTo(page, y);
}

for (const [door, take] of /** @type {const} */ ([
  ['a', takeBusiness],
  ['b', takeFamily],
])) {
  test(`door ${door}: the road meets the other, and the workshop's code flies onto its landmark, then the photo takes over there`, async ({ page }) => {
    test.setTimeout(60000);
    await open(page);
    await take(page);
    const workshop = await spanOf(page, '[data-world-stop="workshop"]');
    await scrollTo(page, workshop.from - 600);
    await expect(canvas(page)).toHaveAttribute('data-section', 'road');
    await inChapter(page, 'workshop', 0.5);
    await expect(canvas(page)).toHaveAttribute('data-section', 'rest:workshop');
    await expect(canvas(page)).toHaveAttribute('data-flight', /^builder:/);
    await expect(railHere(page)).toHaveText('The workshop');
    await inChapter(page, 'workshop', 0.97);
    const target = page.locator('[data-world-stop="workshop"] [data-world-target]');
    await expect(target).toHaveCSS('opacity', '1');
    const box = await target.boundingBox();
    if (!box) throw new Error('no box');
    expect(near(box, await restRect(page)), 'the photo over its landmark').toBe(true);
  });

  test(`door ${door}: at your idea the example flies onto the frame and its sketch shows over it; then the world fades out before the brief`, async ({ page }) => {
    test.setTimeout(60000);
    await open(page);
    await take(page);
    await atYourIdea(page);
    await expect(canvas(page)).toHaveAttribute('data-section', 'rest:your-idea');
    await expect(railHere(page)).toHaveText('Your idea');
    await expect(canvas(page)).toHaveAttribute('data-flight', /^idea:/, { timeout: 15000 });
    await expect(canvas(page)).not.toHaveAttribute('data-flight', /.+/, { timeout: 8000 });
    const sketch = page.locator('[data-world-stop="your-idea"] [data-sketch]');
    await expect(sketch).toBeVisible();
    const box = await sketch.boundingBox();
    if (!box) throw new Error('no sketch');
    expect(near(box, await restRect(page)), 'the sketch over the frame').toBe(true);
    await atTheBrief(page);
    await expect(canvas(page)).toHaveCSS('opacity', '0');
    await expect(railHere(page)).toHaveText('Shipped');
    await expect(page.locator('[data-chapter="brief"]')).toBeVisible();
  });
}

test('on a phone the idea’s form is all reachable while the camera holds, and the visitor’s own line flies', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 393, height: 852 });
  await open(page);
  await takeBusiness(page);
  await atYourIdea(page);
  const field = page.getByLabel('Your idea', { exact: true });
  await field.scrollIntoViewIfNeeded();
  await expect(field).toBeInViewport();
  await field.fill('A dashboard for a road crew');
  const button = page.getByRole('button', { name: 'Sketch it' });
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeInViewport();
  await button.click();
  await expect(canvas(page)).toHaveAttribute('data-flight', /^idea:/);
  await expect(canvas(page)).toHaveAttribute('data-section', 'rest:your-idea');
});

test('switching door at the workshop puts the meeting on the other side', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  await inChapter(page, 'workshop', 0.5);
  await page.getByRole('group', { name: 'Show the site for' }).first().getByRole('button', { name: 'Family' }).click();
  await expect(canvas(page)).toHaveAttribute('data-road', 'b');
  await expect(page.locator('[data-world-stop="workshop"]')).toBeAttached();
  await inChapter(page, 'workshop', 0.5);
  await expect(canvas(page)).toHaveAttribute('data-section', 'rest:workshop');
  expect((await restRect(page)).width).toBeGreaterThan(0);
});

test('a returning visitor reloading at the brief: the world faded out, the rail at shipped', async ({ page }) => {
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
  await open(page);
  await atTheBrief(page);
  await expect(canvas(page)).toHaveCSS('opacity', '0');
  await expect(railHere(page)).toHaveText('Shipped');
  expect(await canvas(page).getAttribute('data-flight')).toBeNull();
});

test('no accessibility violations at the workshop, your idea and the brief', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  await takeBusiness(page);
  const check = async () => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  };
  await inChapter(page, 'workshop', 0.97);
  await check();
  await atYourIdea(page);
  await check();
  await atTheBrief(page);
  await check();
});
