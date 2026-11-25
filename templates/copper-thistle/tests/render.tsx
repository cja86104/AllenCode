import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { App, ROUTER_FUTURE } from '../src/App';
import { RestaurantProvider } from '../src/app/RestaurantContext';
import { restaurant } from '../src/content/restaurant';
import type { Restaurant } from '../src/content/types';

export const clone = (): Restaurant => structuredClone(restaurant);

export function renderSite(path = '/', content: Restaurant = restaurant) {
  return render(
    <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
      <RestaurantProvider restaurant={content}>
        <App />
      </RestaurantProvider>
    </MemoryRouter>,
  );
}

export function renderWith(node: ReactNode, content: Restaurant = restaurant) {
  return render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <RestaurantProvider restaurant={content}>{node}</RestaurantProvider>
    </MemoryRouter>,
  );
}
