// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Locked brand palette (spec section 2).
        ember: '#f97316',
        night: '#0a0a0a',
      },
      screens: {
        // A screen at least as wide as it is tall: the world sets a landmark to the right of its
        // words there (Code World W2.5, `frameCamera`'s `aside`), and below them otherwise.
        wide: { raw: '(min-aspect-ratio: 1/1)' },
      },
      fontFamily: {
        // Named serif-display because `.font-display` already exists in src/index.css.
        'serif-display': ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
