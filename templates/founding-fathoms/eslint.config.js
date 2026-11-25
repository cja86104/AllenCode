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
    files: [
      'eslint.config.js',
      'vite.config.ts',
      'playwright.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
      'scripts/**/*.mjs',
      'e2e/**/*.ts',
    ],
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
    // A horizontally scrolling area is a labelled `region` that takes focus, so keyboard users can scroll
    // it (WCAG 2.1.1; axe "scrollable-region-focusable"). This allows exactly that role alongside tabpanel.
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: false }] },
  },
);
