// @ts-check
import { products } from './products.js';

/**
 * A typed view of `products.js` (which predates type checking and stays as it is) for the pages that
 * render products. Every field beyond the core ones is optional, because each product carries its own.
 *
 * @typedef {{ label: string, value: string }} Result
 * @typedef {{ number: string, label: string }} Stat
 * @typedef {{ icon: string, name: string, desc: string, tags?: string }} Feature
 * @typedef {{ label: string, content: string }} ArchitectureCell
 * @typedef {{ title: string, desc: string }} SecurityItem
 * @typedef {{ name: string, quote: string, desc: string, traits: string }} Archetype
 * @typedef {{ icon: string, name: string, desc: string, featureList: string }} Module
 * @typedef {{ tier: string, price: string, period: string, perUnit?: string, featured?: boolean, features: string[] }} PricingTier
 * @typedef {{ model?: string, note?: string, tiers: PricingTier[] }} Pricing
 * @typedef {{
 *   slug: string, name: string, url: string | null, tagline: string, status: string, category: string,
 *   summary: string, problem: string, solution: string, stack: string[], results: Result[], image: string,
 *   previewVideo?: string, poster?: string, heroAspect?: string, video?: string, showcaseImage?: string,
 *   stats?: Stat[], overview?: string[], features?: Feature[], architecture?: ArchitectureCell[],
 *   security?: SecurityItem[], pricing?: Pricing, archetypes?: Archetype[], modules?: Module[]
 * }} Product
 */

/** @type {readonly Product[]} */
export const catalog = products;
