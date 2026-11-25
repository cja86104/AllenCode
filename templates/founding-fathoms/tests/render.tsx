import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { App } from '../src/App';
import { BreweryProvider } from '../src/app/BreweryContext';
import { brewery } from '../src/content/brewery';
import type { Brewery } from '../src/content/types';

export const clone = (): Brewery => structuredClone(brewery);

export function renderSite(path = '/', content: Brewery = brewery) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BreweryProvider brewery={content}>
        <App />
      </BreweryProvider>
    </MemoryRouter>,
  );
}

export function renderWith(node: ReactNode, content: Brewery = brewery) {
  return render(
    <MemoryRouter>
      <BreweryProvider brewery={content}>{node}</BreweryProvider>
    </MemoryRouter>,
  );
}
