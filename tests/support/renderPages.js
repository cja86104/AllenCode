// @ts-check
// Renders the paths given as arguments with the server entry, in a Node process of its own, and
// prints `{ [path]: html }` as JSON. The hydration test uses it so the server renderer and the
// browser renderer never share one process: React's streaming renderer leaves its last context in
// place when it finishes, which a client render in the same process would then read. Loaded through
// Vite's SSR loader, which leaves packages to Node as the production server bundle does.
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' });
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
  const pages = /** @type {Record<string, string>} */ ({});
  for (const path of process.argv.slice(2)) pages[path] = (await render(path)).html;
  process.stdout.write(JSON.stringify(pages));
} finally {
  await vite.close();
}
