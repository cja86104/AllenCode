// @ts-check
import { createContext } from 'react';

/** @typedef {{ title: string, description: string, noindex: boolean, jsonLd: object[] }} PageMeta */

/**
 * How `usePageMeta` reports the page's title, description, robots choice and own structured data
 * (2026-11-26) during a server render, so the build can write them into that page's own head
 * (Phase 9). Null in the browser.
 */
export const PageMetaContext = createContext(/** @type {((meta: PageMeta) => void) | null} */ (null));
