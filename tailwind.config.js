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
      fontFamily: {
        // Named serif-display because `.font-display` already exists in src/index.css.
        'serif-display': ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
