// @ts-check
import { describe, expect, it } from 'vitest';
import { SYNTAX_COLORS, tokenizeLine } from '../src/field/syntax.js';

describe('tokenizeLine', () => {
  it('keywords, capitalized types and quoted strings get their kinds', () => {
    const tokens = tokenizeLine("export const plan = await Planner.load('week');");
    const kindOf = (/** @type {string} */ text) => tokens.find((t) => t.text === text)?.kind;
    expect(kindOf('export')).toBe('keyword');
    expect(kindOf('await')).toBe('keyword');
    expect(kindOf('Planner')).toBe('type');
    expect(kindOf("'week'")).toBe('string');
    expect(kindOf('plan')).toBe('plain');
  });

  it('tokens rebuild the original line exactly', () => {
    const line = '  <Bundle title="Emergency sub plan" ready={`soon`}> // done';
    expect(tokenizeLine(line).map((t) => t.text).join('')).toBe(line);
  });

  it('an unterminated string runs to the end of the line', () => {
    const tokens = tokenizeLine("const s = 'open");
    expect(tokens.at(-1)).toEqual({ text: "'open", kind: 'string' });
  });

  it('keyword color is the brand orange', () => {
    expect(SYNTAX_COLORS.keyword.map((c) => Math.round(c * 255))).toEqual([249, 115, 22]);
  });
});
