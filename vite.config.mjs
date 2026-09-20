import { defineConfig } from 'vite';

/**
 * Light MPA wrapper around the existing static site.
 *
 * Pages stay classic HTML + IIFE scripts (not ES modules) so Iris content,
 * cache-bust query strings, and GitHub-pages-from-root URLs stay stable.
 * `npm run build` is a faithful copy to dist/ — Vite's Rollup bundler is
 * not used because it would hash/rewrite assets/img paths that live in
 * project-data.js as strings.
 */
export default defineConfig({
  appType: 'mpa',
  publicDir: false,
  server: {
    port: 4321,
    strictPort: false
  },
  preview: {
    port: 4173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
