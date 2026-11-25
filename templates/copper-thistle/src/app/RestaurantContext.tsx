import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import type { Restaurant } from '../content/types';
import { documentTitle } from '../lib/head';

const RestaurantContext = createContext<Restaurant | null>(null);

export function RestaurantProvider({ restaurant, children }: { restaurant: Restaurant; children: ReactNode }) {
  return <RestaurantContext.Provider value={restaurant}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant(): Restaurant {
  const value = useContext(RestaurantContext);
  if (!value) throw new Error('useRestaurant must be used inside <RestaurantProvider>.');
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
  const restaurant = useRestaurant();
  const title = documentTitle(restaurant, page);
  useEffect(() => {
    document.title = title;
  }, [title]);
}
