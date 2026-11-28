// @ts-check
/**
 * One service. The seven with a timeline and deposit carry `timeline` and `deposit`; the two flagships
 * carry `tagline` and `terms` instead (Chris, 2026-11-27): their terms are set per project, so they have
 * no price, timeline or deposit of their own.
 * @typedef {{
 *   slug: string,
 *   name: string,
 *   tagline?: string,
 *   summary: string,
 *   scope: string[],
 *   terms?: string,
 *   timeline?: string,
 *   deposit?: string,
 *   startingPrice?: number,
 *   priceNote?: string,
 * }} Service
 */

/** @type {Service[]} */
export const services = [
  {
    slug: 'immersive-web-experiences',
    name: 'Immersive Web Experiences',
    tagline: 'Beyond websites. Into experiences.',
    summary: 'Interactive 3D websites, digital environments and experiences designed to make the web something people explore.',
    scope: [
      'Interactive 3D websites and environments.',
      'WebGL-powered experiences.',
      '3D storytelling and navigation.',
      'Immersive product presentations.',
      'Interactive brand experiences.',
      'Custom animated digital environments.',
      'Performance-optimized 3D experiences across devices.',
    ],
    terms: 'Timeline and deposit set per project, after scoping.',
  },
  {
    slug: 'intelligent-ai-systems',
    name: 'Intelligent AI Systems',
    tagline: 'Not just AI that answers. AI that works.',
    summary: 'Purpose-built AI assistants, agent teams and intelligent operational systems that do more than generate responses.',
    scope: [
      'AI agents with specialized roles and responsibilities.',
      'Persistent memory and contextual understanding.',
      'Multi-agent collaboration and decision support.',
      'Tool execution and real-world workflows.',
      'Human approval and authorization systems.',
      'Business process automation.',
      'Monitoring, scheduling and proactive operations.',
      'Custom AI-powered applications and operational platforms.',
    ],
    terms: 'Timeline and deposit set per project, after scoping.',
  },
  {
    slug: 'custom-saas-builds',
    name: 'Custom SaaS Builds',
    startingPrice: 18000,
    priceNote: 'Starting at',
    summary:
      'A full custom application, built and shipped by one senior developer — no account managers, no junior devs learning on your dime.',
    scope: [
      'Discovery & technical architecture',
      'Full-stack build (frontend, backend, database, auth, billing)',
      'AI integration where it earns its place',
      'Deployment, monitoring, and a 30-day post-launch warranty',
    ],
    deposit: '40% deposit to begin, balance due on delivery.',
    timeline: '6–12 weeks depending on scope',
  },
  {
    slug: 'mvp-sprints',
    name: 'MVP Sprints',
    startingPrice: 9500,
    priceNote: 'Starting at',
    summary:
      'A tightly scoped 4–6 week build to get a real, usable product in front of real users — built to validate, not to impress investors.',
    scope: [
      'Scope-locked feature set (no mid-sprint drift)',
      'Working product with auth, core flow, and billing if needed',
      'Weekly async progress demos',
      'Handoff docs so you can iterate without me',
    ],
    deposit: '50% deposit to begin, balance due on delivery.',
    timeline: '4–6 weeks',
  },
  {
    slug: 'ai-integration',
    name: 'AI Integration & OpenRouter Routing',
    startingPrice: 4500,
    priceNote: 'Starting at',
    summary:
      'Wire real AI into your product the right way — model routing, cost controls, and fallbacks, not a single brittle API call.',
    scope: [
      'Model selection & OpenRouter routing setup for cost/quality balance',
      'Prompt architecture & evaluation harness',
      'Rate limiting, caching, and fallback handling',
      'Usage & cost dashboard',
    ],
    deposit: '50% deposit to begin, balance due on delivery.',
    timeline: '1–3 weeks',
  },
  {
    slug: 'technical-audits',
    name: 'Technical Audits',
    startingPrice: 2000,
    priceNote: 'Flat fee',
    summary:
      'A senior-level pass over your codebase, infra, and architecture before you scale, raise, or sell — with a prioritized action plan.',
    scope: [
      'Full codebase & architecture review',
      'Security, performance, and scalability findings',
      'Acquisition-readiness scoring',
      'Written report with prioritized fixes',
    ],
    deposit: 'Paid in full to begin.',
    timeline: '3–5 business days',
  },
  {
    slug: 'acquisition-readiness',
    name: 'Acquisition-Readiness Consulting',
    startingPrice: 6000,
    priceNote: 'Starting at',
    summary:
      'Get your codebase, docs, and metrics into a state a buyer can actually diligence in a week, not a month.',
    scope: [
      'Documentation & handoff package',
      'Codebase cleanup & de-risking of technical debt',
      'Metrics & reporting clarity for buyer diligence',
      'Data room technical section preparation',
    ],
    deposit: '50% deposit to begin, balance due on delivery.',
    timeline: '2–4 weeks',
  },
  {
    slug: 'custom-web-development',
    name: 'Custom Web Development',
    startingPrice: 2500,
    priceNote: 'Starting at',
    summary:
      'A custom website built from scratch — no page builders, no bloated themes. HTML/CSS for blazing-fast static sites or React/Vite for dynamic, interactive experiences.',
    scope: [
      'Static sites in HTML/CSS or React/Vite (your choice)',
      'Mobile-first, fully responsive across all devices',
      'Performance-optimized — clean code, fast load times',
      'Deployment & domain setup included',
    ],
    deposit: '50% deposit to begin, balance due on delivery.',
    timeline: '1–3 weeks depending on scope',
  },
  {
    slug: 'ui-ux-design',
    name: 'UI / UX Design',
    startingPrice: 2500,
    priceNote: 'Starting at',
    summary:
      'Interfaces people actually enjoy using — designed around how real users think and click, before a single line of code is written.',
    scope: [
      'User flow mapping & information architecture',
      'High-fidelity mockups (desktop + mobile)',
      'Component library & design system documentation',
      'Handoff-ready specs — implementation-ready for any developer',
    ],
    deposit: '50% deposit to begin, balance due on delivery.',
    timeline: '1–2 weeks depending on scope',
  },
];
