// @ts-check
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { routes } from './App.jsx';
import { PageMetaContext } from './hooks/pageMetaContext.js';

/** @typedef {import('./hooks/pageMetaContext.js').PageMeta} PageMeta */

const ORIGIN = 'https://www.allencodeco.com';

/**
 * Renders one page of the site to HTML as a first visit sees it (Phase 9): the build writes the
 * result into that page's own file. Waits for everything, including the lazily loaded home page.
 * `status` is 404 when the address matched no page.
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
  const html = await new Promise((resolve, reject) => {
    let out = '';
    const target = new Writable({
      write(chunk, _encoding, done) {
        out += chunk.toString();
        done();
      },
      final(done) {
        resolve(out);
        done();
      },
    });
    const stream = renderToPipeableStream(
      <PageMetaContext.Provider value={report}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </PageMetaContext.Provider>,
      {
        onAllReady() {
          stream.pipe(target);
        },
        onShellError: reject,
        onError: reject,
      },
    );
  });

  if (!meta) throw new Error(`${url} rendered without calling usePageMeta, so it has no title.`);
  return { html, meta, status };
}
