// @ts-check
import { createContext } from 'react';

/** @typedef {{ title: string, description: string, noindex: boolean }} PageMeta */

/**
 * How `usePageMeta` reports the page's title, description and robots choice during a server render,
 * so the build can write them into that page's own head (Phase 9). Null in the browser.
 */
export const PageMetaContext = createContext(/** @type {((meta: PageMeta) => void) | null} */ (null));
