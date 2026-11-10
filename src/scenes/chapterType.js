// @ts-check

/**
 * Type sizes for the words beside a chapter's code and screen (services, products, templates), so
 * every chapter reads at the same size. On desktop the sizes grow with the window's width and are
 * held back by its height, because a pinned chapter has to fit its words in one screen.
 * Chris, 2026-11-10: the words beside the screens were half the size of the pictures.
 */

/** The chapter's title: the service, product or template name. */
export const CHAPTER_TITLE =
  'font-serif-display italic leading-[1.05] text-white text-4xl sm:text-5xl lg:text-[length:clamp(3rem,min(4.2vw,7.5vh),4.75rem)]';

/** The chapter's description. */
export const CHAPTER_BODY =
  'leading-relaxed text-white/75 text-base sm:text-lg lg:text-[length:clamp(1.125rem,min(1.45vw,2.5vh),1.5rem)]';

/** A list item under the description, such as a service's scope. */
export const CHAPTER_ITEM =
  'text-white/65 text-sm sm:text-base lg:text-[length:clamp(1rem,min(1.2vw,2.15vh),1.25rem)]';

/** Small uppercase labels: timeline, category, status, counters' captions. */
export const CHAPTER_LABEL = 'mono uppercase text-xs lg:text-[length:clamp(0.75rem,min(0.9vw,1.6vh),0.9375rem)]';

/** The column split when the words sit beside the code in a grid (reduced motion, no WebGL). */
export const CHAPTER_GRID = 'lg:grid-cols-[1fr_1fr]';
