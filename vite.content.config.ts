import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import zipPack from 'vite-plugin-zip-pack';

import { ChromeExtensionManifestPlugin, ViteIconPlugin } from './plugins';
import { isDev, resolveEntries } from './lib/utils';
import packageJson from './package.json';

const zip = process.env.EXTENSION_VERSION;

const externalPlugin = [];
if (zip) {
  externalPlugin.push(zipPack({
    outDir: './archives',
    outFileName: `${packageJson.name}-${zip}.zip`,
  }));
}

function resolveIcons() {
  const target = path.resolve(__dirname, 'src/assets/icons');

  // resolve target dir svg icon names
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) {
    return [];
  }
  const files = fs.readdirSync(target);
  return files.map(file => file.replace(path.extname(file), ''));
}

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
    ...resolveIcons().map(name => ViteIconPlugin({
      icon: `./src/assets/icons/${name}.svg`,
      name,
    })),
    ChromeExtensionManifestPlugin(),
    ...externalPlugin,
  ],

  build: {
    watch: isDev
      ? {}
      : undefined,
    sourcemap: isDev,
    rollupOptions: {
      input: resolveEntries().reduce<Record<string, string>>((acc, item) => {
        acc[item.name] = item.path;
        return acc;
      }, {}),
      output: {
        entryFileNames(chunkInfo) {
          if (/\.html$/.test(chunkInfo.facadeModuleId)) {
            return 'assets/[name]-[hash:8].js';
          }
          return '[name].js';
        },
      },
    },
    cssCodeSplit: true,
    emptyOutDir: false,
  },
});
