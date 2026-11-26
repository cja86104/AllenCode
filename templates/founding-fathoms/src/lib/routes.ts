import type { Brewery } from '../content/types';
import { documentTitle } from './head';

export interface PrerenderRoute {
  /** The address, starting with `/`. `/404` is written as the host's not-found page. */
  path: string;
  title: string;
}

/** Every page written to static HTML at build time, so each reads in full without JavaScript. */
export function prerenderRoutes(brewery: Brewery): PrerenderRoute[] {
  const page = (path: string, label?: string): PrerenderRoute => ({ path, title: documentTitle(brewery, label) });
  return [
    page('/'),
    page('/beer', 'Beer'),
    page('/taproom', 'Taproom'),
    page('/story', 'Our Story'),
    page('/find-us', 'Find Us'),
    page('/shop', 'Shop'),
    page('/contact', 'Contact'),
    page('/404', 'Page not found'),
  ];
}
