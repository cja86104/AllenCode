// @ts-check
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { createRoutes } from './App.jsx';
import Home from './pages/Home.jsx';
import { PageMetaContext } from './hooks/pageMetaContext.js';

/** @typedef {import('./hooks/pageMetaContext.js').PageMeta} PageMeta */

const ORIGIN = 'https://www.allencodeco.com';

/**
 * The site's routes with the home page imported directly, so nothing suspends and one synchronous
 * pass renders every page in full. Ruling (Task 9.4): `renderToString`, not React 18's streaming
 * `renderToPipeableStream`, whose writer flushed its whole 2,048-byte buffer when a multi-byte
 * character did not fit at the end, writing NUL bytes into the page (found on the live
 * /products/underfire-ai, before "— 40ms").
 */
const routes = createRoutes(Home);

/**
 * Renders one page of the site to HTML as a first visit sees it (Phase 9): the build writes the
 * result into that page's own file. `status` is 404 when the address matched no page.
 *
 * @param {string} url A path with an optional query, such as `/about`.
 * @returns {Promise<{ html: string, meta: PageMeta, status: number }>}
 */
export async function render(url) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(new URL(url, ORIGIN)));
  if (context instanceof Response) throw new Error(`${url} answered with a redirect or response, not a page.`);
  const router = createStaticRouter(handler.dataRoutes, context);
  const deepest = context.matches[context.matches.length - 1];
  const status = deepest?.route.path === '*' ? 404 : context.statusCode;

  /** @type {PageMeta | null} */
  let meta = null;
  const report = (/** @type {PageMeta} */ next) => {
    meta = next;
  };
  const html = renderToString(
    <PageMetaContext.Provider value={report}>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </PageMetaContext.Provider>,
  );

  if (!meta) throw new Error(`${url} rendered without calling usePageMeta, so it has no title.`);
  return { html, meta, status };
}
