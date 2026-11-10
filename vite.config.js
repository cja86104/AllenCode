import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The year a prebuilt page's footer shows until it hydrates (src/ssr/buildYear.js); the same value in
  // the browser bundle and the server bundle, so the two agree.
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});