import type { Memorial } from '../content/types';
import { documentTitle } from './head';

export interface PrerenderRoute {
  /** The address, starting with `/`. `/404` is written as the host's not-found page. */
  path: string;
  /** The browser tab title for the page. */
  title: string;
}

/**
 * Every page written to static HTML at build time, so each one reads completely without JavaScript.
 * The family-area demonstration is left out: it loads on demand and is not part of the public memorial.
 */
export function prerenderRoutes(memorial: Memorial): PrerenderRoute[] {
  const page = (path: string, label?: string): PrerenderRoute => ({ path, title: documentTitle(memorial, label) });
  return [
    page('/'),
    page('/story', memorial.person.pronouns.lifeLabel),
    page('/photographs', 'Photographs'),
    ...memorial.photos.items.map((photo) => page(`/photographs/${encodeURIComponent(photo.id)}`, photo.caption)),
    page('/share', memorial.privacy.acceptMemories ? 'Share a memory' : 'Sharing memories'),
    page('/privacy', 'Privacy and sharing'),
    page('/family', 'Family access'),
    page('/404', 'Page not found'),
  ];
}
