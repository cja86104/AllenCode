// @ts-check
import { describe, expect, it } from 'vitest';
import { excerpts, getExcerpt, validateExcerpt } from '../src/content/excerpts/index.js';

/** @returns {import('../src/content/excerpts/index.js').Excerpt} */
const valid = () => ({
  id: 'fixture',
  file: 'fixture.js',
  repo: 'cja86104/AllenCode',
  path: 'src/fixture.js',
  lines: [3, 4],
  commit: 'b6701932a0fb3c170f9e5c060cc0c47086633a64',
  code: 'const a = 1;\nexport default a;',
  becomes: 'a fixture',
  approved: { by: 'Chris', on: '2026-11-08' },
});

describe('excerpt registry', () => {
  it('every registered excerpt passes validation', () => {
    for (const excerpt of Object.values(excerpts)) expect(validateExcerpt(excerpt), excerpt.id).toEqual([]);
  });

  it('ids are unique and match their keys', () => {
    for (const [key, excerpt] of Object.entries(excerpts)) expect(excerpt.id).toBe(key);
  });

  it('every excerpt has repo, path, line range, a 7-to-40-character commit and non-empty code', () => {
    expect(validateExcerpt(valid())).toEqual([]);
    expect(validateExcerpt({ ...valid(), repo: '' })).toContain('repo is required');
    expect(validateExcerpt({ ...valid(), path: '' })).toContain('path is required');
    expect(validateExcerpt({ ...valid(), commit: 'abc' })).toContain('commit must be 7 to 40 hex characters');
    expect(validateExcerpt({ ...valid(), code: '' })).toContain('code is required');
  });

  it('line count equals the line range', () => {
    expect(validateExcerpt({ ...valid(), lines: [3, 9] })).toContain('code has 2 lines but the range covers 7');
  });

  it('no excerpt is longer than 30 lines', () => {
    const code = Array.from({ length: 31 }, (_, i) => `const v${i} = ${i};`).join('\n');
    expect(validateExcerpt({ ...valid(), code, lines: [1, 31] })).toContain('code is longer than 30 lines');
  });

  it('no excerpt contains secret-like content', () => {
    const secrets = [
      "const key = 'sk-abc123def456ghi789';",
      "STRIPE = 'sk_live_51H8xyz';",
      "const pk = 'pk_live_51H8xyz';",
      "token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig'",
      '-----BEGIN PRIVATE KEY-----',
      "aws = 'AKIAIOSFODNN7EXAMPLE'",
      "gh = 'ghp_16C7e42F292c6912E7710c838347Ae178B4a'",
      'OPENROUTER_API_KEY=abc',
      'SUPABASE_SECRET=xyz',
      'GITHUB_TOKEN=xyz',
    ];
    for (const line of secrets) {
      expect(validateExcerpt({ ...valid(), code: `${line}\nexport {};` }), line).toContain('code contains secret-like content');
    }
  });

  it('getExcerpt returns null for an unapproved excerpt unless drafts are allowed', () => {
    const registry = { fixture: { ...valid(), approved: null } };
    expect(getExcerpt('fixture', { registry })).toBeNull();
    expect(getExcerpt('fixture', { registry, includeDrafts: true })?.id).toBe('fixture');
  });

  it('getExcerpt returns null for an invalid excerpt even when drafts are allowed', () => {
    const registry = { fixture: { ...valid(), commit: '' } };
    expect(getExcerpt('fixture', { registry, includeDrafts: true })).toBeNull();
  });

  it('getExcerpt returns null for an unknown id', () => {
    expect(getExcerpt('missing')).toBeNull();
  });
});

describe('approved excerpts', () => {
  it('the ambient excerpt is approved by Chris and renders without drafts', () => {
    expect(excerpts.ambient.approved).toEqual({ by: 'Chris', on: '2026-11-08' });
    expect(getExcerpt('ambient')?.id).toBe('ambient');
  });

  it('the gate excerpt is approved by Chris and renders without drafts', () => {
    expect(excerpts.gate.approved).toEqual({ by: 'Chris', on: '2026-11-08' });
    expect(getExcerpt('gate')?.id).toBe('gate');
  });

  it('the four service excerpts are approved by Chris and render without drafts', () => {
    for (const id of ['service-mvp', 'service-custom', 'service-ai', 'service-audit']) {
      expect(excerpts[id].approved, id).toEqual({ by: 'Chris', on: '2026-11-09' });
      expect(getExcerpt(id)?.id, id).toBe(id);
    }
  });
});
