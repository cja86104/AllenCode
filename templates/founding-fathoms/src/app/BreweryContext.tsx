import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import type { Brewery } from '../content/types';
import { documentTitle } from '../lib/head';

const BreweryContext = createContext<Brewery | null>(null);

export function BreweryProvider({ brewery, children }: { brewery: Brewery; children: ReactNode }) {
  return <BreweryContext.Provider value={brewery}>{children}</BreweryContext.Provider>;
}

export function useBrewery(): Brewery {
  const value = useContext(BreweryContext);
  if (!value) throw new Error('useBrewery must be used inside <BreweryProvider>.');
  return value;
}

const noSubscription = () => () => undefined;

/** False while a prerendered page is being hydrated, true once the page is running in the browser. */
export function useInBrowser(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/** Sets the browser tab title for a page, built from the content. */
export function usePageTitle(page?: string) {
  const brewery = useBrewery();
  const title = documentTitle(brewery, page);
  useEffect(() => {
    document.title = title;
  }, [title]);
}
