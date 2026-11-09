// @ts-check

/**
 * The screen each service chapter's code lands on (spec section 4). Chris supplies these: real
 * screenshots of his live products, or for Crew Advisors, which is not live yet, its concept artwork.
 * Until a chapter has one, it shows its code beside its description.
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
  // Crew Advisors' concept artwork, AI-generated; Chris chose it (2026-11-09) until the app has a real screen.
  'ai-integration': {
    src: '/media/services/crew-advisors.jpg',
    alt: 'Crew Advisors: AI experts that know your business, remember every conversation, and get better over time. Six advisors around a table with their memory and calibration panels.',
    width: 1456,
    height: 1088,
  },
});
