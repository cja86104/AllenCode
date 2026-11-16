// @ts-check
import { describe, expect, it } from 'vitest';
import { businessRoadStops, familyRoadStops, MEETING_STOPS, stopForFlight } from '../src/world/roads.js';
import { DOOR_B_TEMPLATES } from '../src/scenes/TemplateChapter.jsx';
import { excerpts } from '../src/content/excerpts/index.js';
import { products } from '../src/data/products.js';
import { services } from '../src/data/services.js';

describe('businessRoadStops (Code World W2.1)', () => {
  it('runs the services first, then (under the "our work/" sign) the products, then how I work (Chris, 2026-11-16)', () => {
    const stops = businessRoadStops();
    expect(stops.map((stop) => stop.id)).toEqual([
      'mvp-sprints',
      'custom-saas-builds',
      'custom-web-development',
      'ui-ux-design',
      'ai-integration',
      'technical-audits',
      'my-teachers-toolbox',
      'underfire-ai',
      'founders-helm',
      'crew-advisors',
      'how-i-work',
    ]);
    expect(stops.map((stop) => stop.kind)).toEqual([
      'service',
      'service',
      'service',
      'service',
      'service',
      'audit',
      'product',
      'product',
      'product',
      'unfinished',
      'commits',
    ]);
    expect(stops.filter((stop) => stop.signBefore).map((stop) => [stop.id, stop.signBefore])).toEqual([['my-teachers-toolbox', 'our work/']]);
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
      'mvp-sprints',
      'custom-saas-builds',
      'custom-web-development',
      'ui-ux-design',
      'ai-integration',
      'technical-audits',
      'my-teachers-toolbox',
      'underfire-ai',
      'crew-advisors',
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

describe('familyRoadStops (Code World W3.2)', () => {
  it('runs Hearth, then door B’s templates in their order, then done for you', () => {
    const stops = familyRoadStops();
    expect(stops.map((s) => s.id)).toEqual(['hearth', ...DOOR_B_TEMPLATES.map((t) => t.id), 'done-for-you']);
    expect(stops.slice(0, -1).every((s) => s.kind === 'template')).toBe(true);
    expect(stops[stops.length - 1]).toEqual({ id: 'done-for-you', name: 'Done for you', kind: 'words', excerptId: null });
    expect(stops[0].excerptId).toBe('template-hearth');
    expect(stops[0].name).toBe('Hearth — Family Home Page');
  });

  it('leaves out a template whose excerpt is not approved, keeping the rest in order', () => {
    const registry = Object.freeze({ ...excerpts, 'template-vow': { ...excerpts['template-vow'], approved: null } });
    expect(familyRoadStops({ registry }).map((s) => s.id)).toEqual(['hearth', ...DOOR_B_TEMPLATES.filter((t) => t.id !== 'vow').map((t) => t.id), 'done-for-you']);
  });
});

describe('stopForFlight: which road stop a chapter’s flight lands at (Code World W3.5)', () => {
  it('maps door B’s flights to their stops, and leaves door A’s as they are', () => {
    expect(stopForFlight('door-b-intro')).toBe('hearth');
    for (const id of ['evergreen', 'keepsake', 'vow', 'gather', 'folio']) expect(stopForFlight(`template-${id}`)).toBe(id);
    for (const id of ['underfire-ai', 'mvp-sprints', 'gate']) expect(stopForFlight(id)).toBe(id);
  });
});

describe('where the roads meet (Code World W4.2)', () => {
  it('has the workshop then your idea, on both roads', () => {
    expect(MEETING_STOPS).toEqual([
      { id: 'workshop', name: 'The workshop', kind: 'portrait', excerptId: 'builder' },
      { id: 'your-idea', name: 'Your idea', kind: 'sketch', excerptId: null },
    ]);
  });

  it('lands the builder’s flight at the workshop and the idea’s at your idea', () => {
    expect(stopForFlight('builder')).toBe('workshop');
    expect(stopForFlight('idea')).toBe('your-idea');
    expect(stopForFlight('door-b-intro')).toBe('hearth');
  });
});
