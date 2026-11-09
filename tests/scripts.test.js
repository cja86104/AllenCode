/** @vitest-environment node */
// @ts-check
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** @type {{ scripts?: Record<string, string> }} */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const scripts = pkg.scripts ?? {};

describe('package scripts', () => {
  it('package.json defines lint, typecheck, test, test:e2e and verify', () => {
    for (const name of ['lint', 'typecheck', 'test', 'test:e2e', 'verify']) {
      expect(scripts[name], `missing script "${name}"`).toBeTypeOf('string');
    }
  });

  it('verify chains lint, typecheck, test and build', () => {
    expect(scripts.verify).toBe('npm run lint && npm run typecheck && npm run test && npm run build');
  });
});
