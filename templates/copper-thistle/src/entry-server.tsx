import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App, ROUTER_FUTURE } from './App';
import { RestaurantProvider } from './app/RestaurantContext';
import { restaurant } from './content/restaurant';
import { prerenderRoutes } from './lib/routes';

/** Renders one page to HTML at build time (`scripts/prerender.mjs`). */
export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path} future={ROUTER_FUTURE}>
        <RestaurantProvider restaurant={restaurant}>
          <App />
        </RestaurantProvider>
      </StaticRouter>
    </StrictMode>,
  );
}

export const routes = prerenderRoutes(restaurant);
export const site = { url: restaurant.site.url, indexable: restaurant.site.indexable };
