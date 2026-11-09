// @ts-check
/**
 * Files that predate the Sky redesign. They are excluded from lint, typecheck and the
 * banned-directive policy until each one is rewritten or retired. This list only shrinks;
 * BLUEPRINT-SKY-REDESIGN.md Task 7.1 deletes it.
 * @type {readonly string[]}
 */
export const legacyFiles = Object.freeze([
  'src/components/CheckoutModal.jsx',
  'src/components/CodeTerminal.jsx',
  'src/components/CursorGlow.jsx',
  'src/components/CustomCursor.jsx',
  'src/components/Footer.jsx',
  'src/components/Hero.jsx',
  'src/components/HomeCTA.jsx',
  'src/components/HowIWork.jsx',
  'src/components/Magnetic.jsx',
  'src/components/Marquee.jsx',
  'src/components/Nav.jsx',
  'src/components/Noise.jsx',
  'src/components/ProductCard.jsx',
  'src/components/Reveal.jsx',
  'src/components/ScrambleText.jsx',
  'src/components/ScrollToTop.jsx',
  'src/components/WireframeCube.jsx',
  'src/data/products.js',
  'src/data/services.js',
  'src/data/templates.js',
  'src/index.css',
  'src/main.jsx',
  'src/pages/About.jsx',
  'src/pages/CheckoutSuccess.jsx',
  'src/pages/Contact.jsx',
  'src/pages/Home.jsx',
  'src/pages/NotFound.jsx',
  'src/pages/ProductDetail.jsx',
  'src/pages/Products.jsx',
  'src/pages/Services.jsx',
  'src/pages/Templates.jsx',
]);
