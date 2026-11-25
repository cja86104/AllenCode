import type { Config } from 'tailwindcss';
import { colors } from './src/theme/colors';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: colors.navy, deep: colors.navyDeep },
        panel: colors.panel,
        brass: { DEFAULT: colors.brass, bright: colors.brassBright, ink: colors.brassInk },
        cream: { DEFAULT: colors.cream, deep: colors.creamDeep },
        mist: colors.mist,
        slate: colors.slate,
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['"Source Sans 3 Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
