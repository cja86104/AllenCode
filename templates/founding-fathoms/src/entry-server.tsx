import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { BreweryProvider } from './app/BreweryContext';
import { brewery } from './content/brewery';
import { prerenderRoutes } from './lib/routes';

/** Renders one page to HTML at build time (`scripts/prerender.mjs`). */
export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <BreweryProvider brewery={brewery}>
          <App />
        </BreweryProvider>
      </StaticRouter>
    </StrictMode>,
  );
}

export const routes = prerenderRoutes(brewery);
export const site = { url: brewery.site.url, indexable: brewery.site.indexable };
