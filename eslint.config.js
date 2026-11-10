// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const reactFiles = ['src/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'];

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'tools/previews/out/**',
      // Serverless routes are out of scope for the redesign (spec section 2) and stay untouched.
      'api/**',
    ],
  },
  {
    // Inline lint directives are not honored and any that appear fail the run.
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'tools/**/*.{js,mjs}', 'tests/**/*.{js,jsx}', 'e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  { ...react.configs.flat.recommended, files: reactFiles },
  { ...react.configs.flat['jsx-runtime'], files: reactFiles },
  { ...reactHooks.configs.flat.recommended, files: reactFiles },
  { ...jsxA11y.flatConfigs.recommended, files: reactFiles },
  {
    files: reactFiles,
    settings: { react: { version: '18.3' } },
    rules: {
      // Component props are typed with JSDoc and enforced by `npm run typecheck`,
      // so the runtime prop-types rule would duplicate that check.
      'react/prop-types': 'off',
    },
  },
];
