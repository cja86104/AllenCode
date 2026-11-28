// @ts-check
import { templates } from './templates.js';

/**
 * The home page's two order lists, kept in the data so the path bar (in the entry script, Living Source
 * Phase 3) reads them without the scenes that render them. Each scene re-exports its list.
 */

/**
 * Door A's service chapters, in story order (spec section 4, step 4). The two flagships lead
 * (Chris, 2026-11-27); each shows once its excerpt is approved and its screen exists.
 */
export const SERVICE_CHAPTERS = Object.freeze([
  { slug: 'immersive-web-experiences', excerptId: 'service-immersive' },
  { slug: 'intelligent-ai-systems', excerptId: 'service-ai-systems' },
  { slug: 'mvp-sprints', excerptId: 'service-mvp' },
  { slug: 'custom-saas-builds', excerptId: 'service-custom' },
  { slug: 'custom-web-development', excerptId: 'service-web' },
  { slug: 'ui-ux-design', excerptId: 'service-uiux' },
  { slug: 'ai-integration', excerptId: 'service-ai' },
  { slug: 'technical-audits', excerptId: 'service-audit' },
]);

const DOOR_B_CATEGORIES = ['Family and Memories', 'Events', 'Personal and Creative'];

/**
 * Door B's templates after Hearth, which the intro already shows: the family, event and personal ones in
 * catalog order, then the restaurant (Chris, 2026-11-25: the last house, after Folio).
 */
export const DOOR_B_TEMPLATES = Object.freeze([
  ...templates.filter((t) => DOOR_B_CATEGORIES.includes(t.category) && t.id !== 'hearth'),
  ...templates.filter((t) => t.category === 'Restaurant'),
]);
