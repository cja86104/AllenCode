// @ts-check

/**
 * The year the site was built (Vite's `define`, vite.config.js). A prebuilt page shows it until it
 * hydrates, so the browser's first pass matches the HTML; outside a Vite build (the unit tests) it is
 * the current year.
 */
export const BUILD_YEAR = typeof __BUILD_YEAR__ === 'number' ? __BUILD_YEAR__ : new Date().getFullYear();
