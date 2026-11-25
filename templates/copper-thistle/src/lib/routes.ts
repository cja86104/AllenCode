import type { Restaurant } from '../content/types';
import { documentTitle } from './head';

export interface PrerenderRoute {
  /** The address, starting with `/`. `/404` is written as the host's not-found page. */
  path: string;
  title: string;
}

/** Every page written to static HTML at build time, so each reads in full without JavaScript. */
export function prerenderRoutes(restaurant: Restaurant): PrerenderRoute[] {
  const page = (path: string, label?: string): PrerenderRoute => ({ path, title: documentTitle(restaurant, label) });
  return [
    page('/'),
    page('/menu', 'Menu'),
    page('/about', 'About'),
    page('/gallery', 'Gallery'),
    page('/reservations', 'Reservations'),
    page('/contact', 'Contact'),
    page('/404', 'Page not found'),
  ];
}
