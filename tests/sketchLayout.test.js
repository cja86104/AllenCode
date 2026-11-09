// @ts-check
import { describe, expect, it } from 'vitest';
import { IDEA_MAX_LENGTH, capIdea, sketchBlocks, wrapIdea } from '../src/scenes/sketchBlocks.js';
import { SKETCH_COLORS, sketchLayout, sketchShapes } from '../src/field/layouts.js';
import { resolveTransform } from '../src/field/resolveTransform.js';
import { PRINTABLE_ASCII } from '../src/field/glyphAtlas.js';
import { editorSize } from '../src/field/editorMetrics.js';

const kinds = (/** @type {string} */ idea) => sketchBlocks(idea).map((block) => block.kind);

describe('sketchBlocks', () => {
  it('every sketch has a header, a hero and a cta', () => {
    for (const idea of ['', 'a booking site for my bakery', 'shop photos menu blog booking', '🎂 for grandma', 'xyz']) {
      const list = kinds(idea);
      expect(list[0]).toBe('header');
      expect(list[1]).toBe('hero');
      expect(list[list.length - 1]).toBe('cta');
    }
  });

  it('booking adds a calendar; shop a grid; photos a gallery; menu a list; blog posts', () => {
    expect(kinds('a booking site for my bakery')).toContain('calendar');
    expect(kinds('an online shop for candles')).toContain('grid');
    expect(kinds('wedding photos')).toContain('gallery');
    expect(kinds('our menu')).toContain('list');
    expect(kinds('a blog about trains')).toContain('posts');
  });

  it('an empty idea gives the base sketch', () => {
    expect(kinds('')).toEqual(['header', 'hero', 'cta']);
    expect(kinds('   ')).toEqual(['header', 'hero', 'cta']);
  });

  it('matches whole words in any case, in a fixed block order', () => {
    expect(kinds('Books and stories')).toEqual(['header', 'hero', 'cta']);
    expect(kinds('BLOG with a SHOP and Booking')).toEqual(['header', 'hero', 'calendar', 'grid', 'posts', 'cta']);
  });

  it('labels every block in plain words', () => {
    for (const block of sketchBlocks('shop photos menu blog booking')) expect(block.label).toMatch(/^[A-Z][a-z ]+$/);
  });
});

describe('capIdea', () => {
  it('input is capped at 120 characters', () => {
    expect(capIdea('a'.repeat(500))).toHaveLength(IDEA_MAX_LENGTH);
    expect(IDEA_MAX_LENGTH).toBe(120);
  });

  it('collapses whitespace and never splits an emoji at the cut', () => {
    expect(capIdea('  a\n\tbakery   site ')).toBe('a bakery site');
    const capped = capIdea(`${'a'.repeat(119)}🎂`);
    expect(capped).toBe('a'.repeat(119));
    expect(capped.endsWith('\ud83c')).toBe(false);
  });
});

describe('wrapIdea', () => {
  it('breaks at spaces to fit the columns and splits a word longer than a line', () => {
    expect(wrapIdea('a booking site for my bakery', 12)).toBe('a booking\nsite for my\nbakery');
    expect(wrapIdea('supercalifragilistic', 8)).toBe('supercal\nifragili\nstic');
  });

  it('counts an emoji as one column', () => {
    expect(wrapIdea('🎂🎂🎂 cake', 4)).toBe('🎂🎂🎂\ncake');
  });
});

describe('sketchLayout', () => {
  const box = { x: 40, y: 60, w: 600, h: 450 };

  it('every landing place is inside the box', () => {
    const points = sketchLayout(sketchBlocks('shop photos menu blog booking'), box, 6);
    expect(points.length).toBeGreaterThan(500);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(box.x);
      expect(p.x).toBeLessThanOrEqual(box.x + box.w);
      expect(p.y).toBeGreaterThanOrEqual(box.y);
      expect(p.y).toBeLessThanOrEqual(box.y + box.h);
    }
  });

  it('the blocks stack top to bottom without overlapping, and the cta has an orange button', () => {
    const placed = sketchShapes(sketchBlocks('a booking site'), box);
    for (let i = 1; i < placed.length; i += 1) {
      expect(placed[i].box.y).toBeGreaterThanOrEqual(placed[i - 1].box.y + placed[i - 1].box.h);
    }
    const cta = placed[placed.length - 1];
    expect(cta.shapes.some((shape) => shape.tone === 'accent')).toBe(true);
    const points = sketchLayout(sketchBlocks(''), box, 6);
    expect(points.some((p) => p.color === SKETCH_COLORS.accent)).toBe(true);
  });

  it('is deterministic', () => {
    expect(sketchLayout(sketchBlocks('menu'), box, 5)).toEqual(sketchLayout(sketchBlocks('menu'), box, 5));
  });
});

describe('the flight of an idea', () => {
  it('emoji and other scripts are skipped in the flight; every particle is a typed character', () => {
    const glyphs = [...PRINTABLE_ASCII];
    const atlas = { indexOf: (/** @type {string} */ c) => glyphs.indexOf(c) };
    const code = 'café 🎂 for グランマ';
    const { transformation } = resolveTransform(
      {
        key: 'idea:1',
        code,
        sourceBox: { x: 0, y: 0, ...editorSize(code) },
        target: { kind: 'sketch', blocks: sketchBlocks(code) },
        targetBox: { x: 0, y: 100, w: 400, h: 300 },
        step: 8,
      },
      { atlas, budget: 2000 },
    );
    expect(transformation.count).toBeGreaterThan(0);
    const allowed = new Set([...'caffor'].map((c) => atlas.indexOf(c)));
    for (const g of transformation.glyph) expect(allowed.has(g)).toBe(true);
  });
});
