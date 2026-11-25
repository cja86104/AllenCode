import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { App } from '../src/App';
import { RestaurantProvider } from '../src/app/RestaurantContext';
import { restaurant } from '../src/content/restaurant';
import type { Restaurant } from '../src/content/types';

export const clone = (): Restaurant => structuredClone(restaurant);

export function renderSite(path = '/', content: Restaurant = restaurant) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RestaurantProvider restaurant={content}>
        <App />
      </RestaurantProvider>
    </MemoryRouter>,
  );
}

export function renderWith(node: ReactNode, content: Restaurant = restaurant) {
  return render(
    <MemoryRouter>
      <RestaurantProvider restaurant={content}>{node}</RestaurantProvider>
    </MemoryRouter>,
  );
}
