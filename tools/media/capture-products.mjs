// @ts-check
// Captures the public screens each live product's loop is made from (spec section 7.5).
// Public pages only: never a signed-in screen, never a form, never credentials.
// Usage: npm run media:capture   (then npm run media:loops)
// Needs Playwright's Chromium (`npx playwright install chromium`), or PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

/**
 * Where a frame is taken. `top` scrolls to the top of the page; `heading` scrolls the first element
 * with that exact text to `offset` pixels below the top of the screen.
 * `cropAbove` crops the frame (keeping the 16:10 shape) to end above the first element with that
 * text, for a screen whose button shows a price. `notPrices` states why the dollar figures a frame
 * shows are not prices (for example sample revenue in a dashboard illustration); it lifts only the
 * dollar check for that frame.
 * @typedef {({ top: true, cropAbove?: string } | { heading: string, offset: number }) & { notPrices?: string }} Shot
 */

/** @type {Record<string, { url: string, shots: Shot[] }>} */
export const PRODUCT_SHOTS = {
  'my-teachers-toolbox': {
    url: 'https://www.myteacherstoolbox.com/',
    shots: [
      { top: true },
      { heading: 'Everything you need.', offset: 150 },
      { heading: 'Do the math on your own week.', offset: 130 },
      { heading: 'Parent Communication', offset: 520 },
    ],
  },
  'underfire-ai': {
    url: 'https://www.underfireai.com/',
    shots: [
      { top: true, cropAbove: 'Start Practicing' },
      { heading: 'Everything you need to land the offer', offset: 150 },
      { heading: 'Prepare for any interview format', offset: 150 },
      { heading: 'From nervous to offer-ready in 5 steps', offset: 150 },
      { heading: 'Common questions', offset: 150 },
    ],
  },
  'founders-helm': {
    url: 'https://www.foundershelm.com/',
    shots: [
      { top: true, notPrices: 'sample MRR and deal values in the hero dashboard illustration' },
      { heading: 'Not another tab.', offset: 150 },
      { heading: 'Ship the page', offset: 230 },
      { heading: 'It has read', offset: 230, notPrices: 'sample MRR and churn figures in the AI advisor chat illustration' },
      { heading: 'Everything else you were', offset: 120 },
    ],
  },
};

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 1.25;
const SETTLE_MS = 1600;

/**
 * Text no frame may show: prices (the site renders none) and the My Teachers Toolbox claims that
 * were withdrawn from its marketing.
 */
const DOLLARS = /\$\s?\d/;
const FORBIDDEN = [DOLLARS, /\b46 countries\b/i, /\bnew (elementary )?teachers\b/i, /\bfirst[- ]year teachers?\b/i];

/**
 * Text that is visible inside a rectangle of the viewport.
 * @param {import('@playwright/test').Page} page
 * @param {{ x: number, y: number, width: number, height: number }} clip
 */
async function visibleText(page, clip) {
  return page.evaluate((rect) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const parts = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const parent = node.parentElement;
      if (!text || !parent) continue;
      const style = getComputedStyle(parent);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) {
        const inside = box.right > rect.x && box.left < rect.x + rect.width && box.bottom > rect.y && box.top < rect.y + rect.height;
        if (inside && box.width > 0 && box.height > 0) {
          parts.push(text);
          break;
        }
      }
    }
    return parts.join(' ');
  }, clip);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {Shot} shot
 * @returns {Promise<{ x: number, y: number, width: number, height: number }>}
 */
async function frame(page, shot) {
  if ('top' in shot) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(SETTLE_MS);
    if (!shot.cropAbove) return { x: 0, y: 0, ...VIEWPORT };
    const box = await page.getByText(shot.cropAbove, { exact: false }).first().boundingBox();
    if (!box) throw new Error(`"${shot.cropAbove}" is not on the page`);
    const height = Math.floor(box.y - 16);
    return { x: 0, y: 0, width: Math.round(height * 1.6), height };
  }
  const target = page.getByText(shot.heading, { exact: false }).first();
  await target.scrollIntoViewIfNeeded();
  const top = await target.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, Math.round(top - shot.offset)));
  await page.waitForTimeout(SETTLE_MS);
  return { x: 0, y: 0, ...VIEWPORT };
}

export async function captureProducts(outDir = 'tools/media/out') {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    for (const [slug, { url, shots }] of Object.entries(PRODUCT_SHOTS)) {
      const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE, colorScheme: 'dark' });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      mkdirSync(`${outDir}/${slug}`, { recursive: true });
      for (const [index, shot] of shots.entries()) {
        const clip = await frame(page, shot);
        const text = await visibleText(page, clip);
        const checks = shot.notPrices ? FORBIDDEN.filter((pattern) => pattern !== DOLLARS) : FORBIDDEN;
        const hit = checks.find((pattern) => pattern.test(text));
        if (hit) throw new Error(`${slug} frame ${index + 1} shows text matching ${hit}: move or crop that frame`);
        if (shot.notPrices && DOLLARS.test(text)) console.log(`${slug} frame ${index + 1}: dollar figures allowed (${shot.notPrices})`);
        const path = `${outDir}/${slug}/frame-${index + 1}.png`;
        await page.screenshot({ path, clip });
        console.log(`${slug} frame ${index + 1}: ${clip.width} x ${clip.height}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) await captureProducts();
