// @ts-check
import serviceAiSystems from './service-ai-systems.js';

/**
 * Excerpts waiting on Chris's approval. Nothing the site ships imports this module, so a draft never
 * reaches the public bundle; the excerpt check (`npm run excerpts:verify`) and the tests read it.
 * An excerpt moves from here into index.js once Chris approves it.
 * @type {Readonly<Record<string, import('./index.js').Excerpt>>}
 */
export const draftExcerpts = Object.freeze({
  [serviceAiSystems.id]: serviceAiSystems,
});
