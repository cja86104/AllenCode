// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
  {
    // Inline lint directives are not honored; any that appear fail the run.
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['eslint.config.js', 'vite.config.ts', 'playwright.config.ts', 'scripts/**/*.mjs', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ...jsxA11y.flatConfigs.strict,
  },
  {
    // The audio memory is audio-only. WCAG 2.2 SC 1.2.1 is met by its transcript, which the content model
    // requires and the page enforces (src/lib/content.ts, src/sections/OptionalModules.tsx). Captions are
    // added as a <track> whenever the family supplies a WebVTT file. Scoped to this one file.
    files: ['src/sections/OptionalModules.tsx'],
    rules: { 'jsx-a11y/media-has-caption': 'off' },
  },
);
