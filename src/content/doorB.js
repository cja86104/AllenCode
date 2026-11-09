// @ts-check

/**
 * Door B's words (spec section 4, Door B chapters): plain language for people who want a site for
 * themselves, their family or an event. No jargon, no prices. Chris reviews this copy at the
 * Phase 5 stop; it lives here so it can be edited in one place.
 */

export const DOOR_B_INTRO = Object.freeze({
  eyebrow: 'For families, events and everyday people',
  title: 'A website that feels like yours.',
  body: Object.freeze([
    "You don't need to read a line of code. Tell me about your family, your big day or your work, and I'll turn it into a site with your names, your photos and your dates.",
    'Watch it happen: the code on the screen becomes a family’s home page.',
  ]),
  note: 'You never have to touch the code. That part is mine.',
});

export const TEMPLATE_CHAPTER = Object.freeze({
  eyebrow: 'Start from a design',
  title: 'Pick one. I make it yours.',
  allLink: 'See every template',
});

/** One plain sentence per template shown on Door B. */
export const TEMPLATE_STORIES = Object.freeze(
  /** @type {Record<string, string>} */ ({
    evergreen: 'A place to remember someone: their story, their photos, and the details for the service.',
    keepsake: 'Every first for a new baby, shared with the people who want to see it.',
    vow: 'Your day, your schedule, where everyone can stay, and an easy way to say yes.',
    gather: 'Reunions and parties: who is coming, where to sleep and what to bring.',
    folio: 'Show your work, tell your story, and take commissions or bookings.',
  }),
);

/** Done for you (spec section 4, step 6B): a custom site, routed to the same project brief. */
export const DONE_FOR_YOU = Object.freeze({
  eyebrow: 'Done for you',
  title: 'Rather not pick a template?',
  body: "Tell me what you need and I'll design it from scratch, with your words, your photos and your colors. It starts with the same short brief.",
  link: 'Start with the brief',
});
