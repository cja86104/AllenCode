// @ts-check

/**
 * The screen each service chapter's code lands on (spec section 4). Chris supplies these: real
 * screenshots of his own live work. Until a chapter has one, it shows its code beside its description.
 *
 * A screen may also loop a video (`video`, an mp4 over its `src` poster, which the code lands on):
 * the two services added on 2026-11-16 loop recordings of this site's own Code World build.
 *
 * @type {Readonly<Record<'mvp-sprints' | 'custom-saas-builds' | 'custom-web-development' | 'ui-ux-design' | 'ai-integration', { src: string, alt: string, width: number, height: number, video?: string } | null>>}
 */
export const serviceScreens = Object.freeze({
  'mvp-sprints': {
    src: '/media/services/underfire-landing.jpg',
    alt: 'The UnderFire AI landing page: "Master Your Interviews. We put you under fire first."',
    width: 1416,
    height: 660,
  },
  'custom-saas-builds': {
    src: '/media/services/founders-helm-dashboard.jpg',
    alt: 'The Founders Helm dashboard: revenue, contacts, deals and projects above its ten tools.',
    width: 1800,
    height: 982,
  },
  // This site's own Code World, recorded from the build (Chris, 2026-11-16): a scroll from the empty file
  // through the world and the fork to a product's real screen.
  'custom-web-development': {
    src: '/media/services/custom-web-development.jpg',
    video: '/media/services/custom-web-development.mp4',
    alt: 'This site’s Code World: a road of real code running from an empty file to a fork, then a product’s code becoming its live screen.',
    width: 1280,
    height: 800,
  },
  // The same build's idea chapter (Chris, 2026-11-16): a one-line idea typed into a file and turned
  // into a wireframe of the site it describes.
  'ui-ux-design': {
    src: '/media/services/ui-ux-design.jpg',
    video: '/media/services/ui-ux-design.mp4',
    alt: 'A one-line idea, “A booking site for my bakery”, turned into a wireframe: navigation, headline, a booking calendar and a call to action.',
    width: 1280,
    height: 800,
  },
  // Chris's own OpenRouter activity dashboard (2026-11-10), replacing the Crew Advisors concept art.
  'ai-integration': {
    src: '/media/services/openrouter-usage.jpg',
    alt: 'An OpenRouter usage dashboard: spend, 1.38K requests and 17.3M tokens over the period, a 74.2% cache hit rate, the top API keys and apps, and daily spend by model.',
    width: 1260,
    height: 796,
  },
});
