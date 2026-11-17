// @ts-check
import { describe, expect, it } from 'vitest';
import { LETTER_COLS, LETTER_ROWS, letterRows, wordLayout, wordRoad, WORD_SUB } from '../src/world/wordRoad.js';
import { WORLD_VERTEX_SHADER } from '../src/world/worldShaders.js';
import { stretchFor, wordFor } from '../src/world/stretches.js';
import { layoutStretch, STRETCH, STRETCH_LEAD_AT } from '../src/world/stretchLayout.js';
import { roadSizes } from '../src/world/roadLayout.js';
import ambient from '../src/content/excerpts/ambient.js';

/**
 * The inner pages' road spells its page (Chris, 2026-11-17): "for these sections of road i want the
 * moving text in the road using multiple small to make bigger letters and i want it to spell out what
 * it is … running forward so you just see the road with the screen at the end". The first letter
 * farthest (it reads top to bottom on screen), only the word on the road, a product's page its name.
 */

/** The belt wraps where its distance along the road is a whole number of loops, so a region starts at 0. */
const REGION = { near: 0, far: -28, width: 3.2 };

describe('the letters', () => {
  it('draws every letter of the alphabet, and a space, on a 5 by 7 grid', () => {
    for (const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ') {
      const rows = letterRows(char);
      expect(rows, char).toHaveLength(LETTER_ROWS);
      for (const row of rows) expect(row, char).toMatch(new RegExp(`^[#.]{${LETTER_COLS}}$`));
      expect(rows.join('').includes('#'), char).toBe(char !== ' ');
    }
    expect(() => letterRows('?')).toThrow();
  });

  it('draws the letters as a dot-matrix font does', () => {
    expect(letterRows('A')).toEqual(['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#']);
    expect(letterRows('S')).toEqual(['.####', '#....', '#....', '.###.', '....#', '....#', '####.']);
    expect(letterRows('Z')).toEqual(['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####']);
  });
});

describe('the word on the road', () => {
  it('lays the letters along the road, the first farthest, all one size, within the road and the region', () => {
    const boxes = wordLayout('PRODUCTS', REGION);
    expect(boxes.map((b) => b.char).join('')).toBe('PRODUCTS');
    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];
      expect(box.far).toBeGreaterThanOrEqual(REGION.far);
      expect(box.near).toBeLessThanOrEqual(REGION.near);
      expect(box.width).toBeLessThanOrEqual(REGION.width - 0.6);
      expect(box.near - box.far).toBeCloseTo(boxes[0].near - boxes[0].far, 9);
      // Farther than the next letter, with a gap between.
      if (i > 0) expect(box.far).toBeGreaterThan(boxes[i - 1].near);
    }
  });

  it('shrinks a long word to fit the region, never past it', () => {
    const long = wordLayout('MYTEACHERSTOOLBOX', REGION);
    const short = wordLayout('ABOUT', REGION);
    expect(long[0].far).toBeGreaterThanOrEqual(REGION.far);
    expect(long[long.length - 1].near).toBeLessThanOrEqual(REGION.near);
    expect(long[0].near - long[0].far).toBeLessThan(short[0].near - short[0].far);
  });

  it('fills each lit dot of a letter with a cluster of the road’s characters, about a third in colour, moving together', () => {
    const road = wordRoad('ABOUT', REGION, ambient.code, 3);
    const lit = [...'ABOUT'].reduce((sum, char) => sum + letterRows(char).join('').split('#').length - 1, 0);
    expect(road.glyphs.length).toBe(lit * WORD_SUB * WORD_SUB);
    const stream = /** @type {Float32Array} */ (road.stream);
    const loop = REGION.near - REGION.far;
    let coloured = 0;
    for (let i = 0; i < road.glyphs.length; i += 1) {
      const x = road.positions[i * 3];
      const z = road.positions[i * 3 + 2];
      expect(Math.abs(x)).toBeLessThanOrEqual(REGION.width / 2);
      expect(z).toBeGreaterThanOrEqual(REGION.far - 0.01);
      expect(z).toBeLessThanOrEqual(REGION.near + 0.01);
      // All on one belt: forward down the road, the whole region its loop (a negative loop: together).
      expect([...stream.subarray(i * 4, i * 4 + 4)]).toEqual([0, 0, -1, -loop]);
      const [r, g, b] = road.colors.subarray(i * 4, i * 4 + 3);
      if (Math.abs(r - g) > 0.1 || Math.abs(g - b) > 0.1) coloured += 1;
    }
    expect(coloured / road.glyphs.length).toBeGreaterThan(0.25);
    expect(coloured / road.glyphs.length).toBeLessThan(0.42);
  });

  it('moves a negative loop as one belt in the renderer: each glyph by the same time, wrapping at the region’s ends', () => {
    expect(WORLD_VERTEX_SHADER).toMatch(/aStream\.w < 0\.0/);
  });
});

describe('the stretch: one screen at the end of a short road', () => {
  it('stands only the lead, at the end of the road, the same distance away on every page', () => {
    for (const path of ['/products', '/services', '/templates', '/about', '/contact', '/products/underfire-ai']) {
      const stretch = stretchFor(path);
      if (!stretch) throw new Error(`no stretch for ${path}`);
      expect(stretch.stops, path).toEqual([stretch.lead]);
      const layout = layoutStretch(stretch.stops, roadSizes(stretch.stops, stretch.sources), { width: 1440, height: 900 });
      expect(layout.landmarks, path).toHaveLength(1);
      expect(-layout.landmarks[0].center[2], path).toBeCloseTo(STRETCH_LEAD_AT, 9);
    }
  });

  it('is a screen of scroll: half driving to the screen, then the landing', () => {
    expect(STRETCH.screens).toBe(1);
    expect(STRETCH.drive).toBeCloseTo(0.5, 9);
    expect(STRETCH.landFrom).toBeCloseTo(0.55, 9);
  });

  it('spells each page: the section, or a product’s name', () => {
    expect(wordFor('/products')).toBe('PRODUCTS');
    expect(wordFor('/services')).toBe('SERVICES');
    expect(wordFor('/templates')).toBe('TEMPLATES');
    expect(wordFor('/about')).toBe('ABOUT');
    expect(wordFor('/contact')).toBe('CONTACT');
    expect(wordFor('/products/underfire-ai')).toBe('UNDERFIRE AI');
    expect(wordFor('/products/my-teachers-toolbox')).toBe('MY TEACHERS TOOLBOX');
    expect(wordFor('/nope')).toBeNull();
  });
});
