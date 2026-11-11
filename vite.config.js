import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vercelPreview } from './tools/prerender/vercelPreview.mjs';

export default defineConfig({
  // vercelPreview: `vite preview` answers like Vercel for the prebuilt pages (Phase 9, vercel.json).
  plugins: [react(), vercelPreview()],
  // The year a prebuilt page's footer shows until it hydrates (src/ssr/buildYear.js); the same value in
  // the browser bundle and the server bundle, so the two agree.
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});
