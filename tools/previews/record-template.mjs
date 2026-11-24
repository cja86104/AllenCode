// @ts-check
// Films a built template (templates/<id>) into its loop and poster, the same way record.mjs films the
// concept previews. The template must be running from its production build first:
//   cd templates/<id> && npm run build && npm run preview -- --port 4174 --strictPort
// then, from the repository root:
//   node tools/previews/record-template.mjs <id> [url] [scroll-limit-px]   (needs ffmpeg on PATH)
// The scroll limit keeps a long page to its opening screens; the default films the first 3,200 px.
import { chromium } from '@playwright/test';
import { filmPage } from './record.mjs';

const [id, url = 'http://localhost:4174/', limit = '3200'] = process.argv.slice(2);
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Usage: node tools/previews/record-template.mjs <id> [url] [scroll-limit-px]');
  process.exit(1);
}
const scrollLimit = Number(limit);
if (!Number.isFinite(scrollLimit) || scrollLimit <= 0) {
  console.error(`The scroll limit must be a positive number of pixels, not "${limit}".`);
  process.exit(1);
}

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  await filmPage(browser, id, url, { scrollLimit });
} finally {
  await browser.close();
}
