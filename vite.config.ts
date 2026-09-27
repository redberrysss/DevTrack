import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8 bundles with Rolldown, where manual chunking is expressed as
        // named code-splitting groups. Keeping React, Firebase and the chart
        // library in their own chunks stops the auth and dashboard bundles from
        // invalidating on every app change.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
            // Firebase is split per product. `AuthProvider` wraps the whole app,
            // so a marketing page only needs the Auth/App core; Firestore and
            // Storage are fetched by the authenticated pages that actually use them.
            {
              name: 'firebase-auth',
              test: /node_modules[\\/](@firebase[\\/](app|auth|logger|util|component|webchannel|installations)|firebase[\\/](app|auth))[\\/]/,
            },
            {
              name: 'firebase-firestore',
              test: /node_modules[\\/](@firebase[\\/]firestore|firebase[\\/]firestore)[\\/]/,
            },
            {
              name: 'firebase-storage',
              test: /node_modules[\\/](@firebase[\\/]storage|firebase[\\/]storage)[\\/]/,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|victory-vendor|d3-[a-z-]+|decimal\.js-light)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
});
