import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { isDev } from './lib/utils';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    '__DEV__': isDev,
    '__NAME__': JSON.stringify(packageJson.name),
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
  ],

  build: {
    watch: isDev
      ? {}
      : undefined,
    sourcemap: isDev,
    emptyOutDir: false,
  },
});
