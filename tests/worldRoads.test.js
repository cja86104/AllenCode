// @ts-check
import { describe, expect, it } from 'vitest';
import { businessRoadStops } from '../src/world/roads.js';
import { excerpts } from '../src/content/excerpts/index.js';
import { products } from '../src/data/products.js';
import { services } from '../src/data/services.js';

describe('businessRoadStops (Code World W2.1)', () => {
  it('runs products first, then the services in story order, then how I work', () => {
    const stops = businessRoadStops();
    expect(stops.map((stop) => stop.id)).toEqual([
      'my-teachers-toolbox',
      'underfire-ai',
      'founders-helm',
      'crew-advisors',
      'mvp-sprints',
      'custom-saas-builds',
      'ai-integration',
      'technical-audits',
      'how-i-work',
    ]);
    expect(stops.map((stop) => stop.kind)).toEqual([
      'product',
      'product',
      'product',
      'unfinished',
      'service',
      'service',
      'service',
      'audit',
      'commits',
    ]);
  });

  it('names each stop with the product’s or service’s own name, and carries its excerpt', () => {
    const stops = businessRoadStops();
    for (const stop of stops) {
      const product = products.find((p) => p.slug === stop.id);
      const service = services.find((s) => s.slug === stop.id);
      if (product) expect(stop.name).toBe(product.name);
      else if (service) expect(stop.name).toBe(service.name);
      else expect(stop).toEqual({ id: 'how-i-work', name: 'How I work', kind: 'commits', excerptId: null });
    }
    expect(stops.find((stop) => stop.id === 'underfire-ai')?.excerptId).toBe('product-underfire-ai');
    expect(stops.find((stop) => stop.id === 'technical-audits')?.excerptId).toBe('service-audit');
  });

  it('leaves out a stop whose excerpt is not approved, keeping the rest in order', () => {
    const registry = Object.freeze({
      ...excerpts,
      'product-founders-helm': { ...excerpts['product-founders-helm'], approved: null },
    });
    const ids = businessRoadStops({ registry }).map((stop) => stop.id);
    expect(ids).not.toContain('founders-helm');
    expect(ids).toEqual([
      'my-teachers-toolbox',
      'underfire-ai',
      'crew-advisors',
      'mvp-sprints',
      'custom-saas-builds',
      'ai-integration',
      'technical-audits',
      'how-i-work',
    ]);
  });

  it('shows a draft only when drafts are asked for', () => {
    const registry = Object.freeze({
      ...excerpts,
      'service-ai': { ...excerpts['service-ai'], approved: null },
    });
    expect(businessRoadStops({ registry }).map((stop) => stop.id)).not.toContain('ai-integration');
    expect(businessRoadStops({ registry, includeDrafts: true }).map((stop) => stop.id)).toContain('ai-integration');
  });
});
