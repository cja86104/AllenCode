// @ts-check
/**
 * Files that predate the Sky redesign. They are excluded from lint, typecheck and the
 * banned-directive policy until each one is rewritten or retired. This list only shrinks;
 * BLUEPRINT-SKY-REDESIGN.md Task 7.1 deletes it.
 * @type {readonly string[]}
 */
export const legacyFiles = Object.freeze([
  'src/components/CheckoutModal.jsx',
  'src/components/Magnetic.jsx',
  'src/components/Noise.jsx',
  'src/components/Reveal.jsx',
  'src/data/products.js',
  'src/data/services.js',
  'src/data/templates.js',
  'src/index.css',
  'src/main.jsx',
  'src/pages/Services.jsx',
]);
