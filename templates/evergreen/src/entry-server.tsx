import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { MemorialProvider } from './app/MemorialContext';
import { memorial } from './content/memorial';
import { prerenderRoutes } from './lib/routes';

/** Renders one page to HTML at build time (`scripts/prerender.mjs`). */
export function render(path: string, renderedAt: number): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <MemorialProvider memorial={memorial} renderedAt={renderedAt}>
          <App />
        </MemorialProvider>
      </StaticRouter>
    </StrictMode>,
  );
}

export const routes = prerenderRoutes(memorial);
export const site = { url: memorial.site.url, mode: memorial.privacy.mode };
