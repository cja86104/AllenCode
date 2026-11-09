// @ts-check

/**
 * The real product screen each service chapter's code lands on (spec section 4). Chris supplies
 * these as real screenshots of his live products; until a chapter has one, it shows its code beside
 * its description.
 *
 * @type {Readonly<Record<'mvp-sprints' | 'custom-saas-builds' | 'ai-integration', { src: string, alt: string, width: number, height: number } | null>>}
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
    height: 1125,
  },
  'ai-integration': null,
});
