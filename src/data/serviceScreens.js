// @ts-check

/**
 * The screen each service chapter's code lands on (spec section 4). Chris supplies these: real
 * screenshots of his own live work. Until a chapter has one, it shows its code beside its description.
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
    height: 982,
  },
  // Chris's own OpenRouter activity dashboard (2026-11-10), replacing the Crew Advisors concept art.
  'ai-integration': {
    src: '/media/services/openrouter-usage.jpg',
    alt: 'An OpenRouter usage dashboard: spend, 1.38K requests and 17.3M tokens over the period, a 74.2% cache hit rate, the top API keys and apps, and daily spend by model.',
    width: 1260,
    height: 796,
  },
});
