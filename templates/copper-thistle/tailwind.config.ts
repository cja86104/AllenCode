import type { Config } from 'tailwindcss';
import { colors } from './src/theme/colors';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: colors.cream,
        paper: colors.paper,
        charcoal: colors.charcoal,
        burgundy: { DEFAULT: colors.burgundy, deep: colors.burgundyDeep },
        gold: { DEFAULT: colors.gold, ink: colors.goldInk },
        stone: colors.stone,
        mist: colors.mist,
      },
      fontFamily: {
        display: ['"Playfair Display Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
