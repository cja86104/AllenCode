import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { RestaurantProvider } from './app/RestaurantContext';
import { restaurant } from './content/restaurant';
import { prerenderRoutes } from './lib/routes';

/** Renders one page to HTML at build time (`scripts/prerender.mjs`). */
export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <RestaurantProvider restaurant={restaurant}>
          <App />
        </RestaurantProvider>
      </StaticRouter>
    </StrictMode>,
  );
}

export const routes = prerenderRoutes(restaurant);
export const site = { url: restaurant.site.url, indexable: restaurant.site.indexable };
