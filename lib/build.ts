import _ from 'lodash';
import { build, LibraryOptions } from 'vite';

import { resolveEntries } from './utils';

const libs: LibraryOptions[] = resolveEntries(true).map((item) => ({
  name: _.camelCase(item.name),
  entry: item.path,
  formats: ['es'],
  fileName: () => `${item.name}.js`,
  emitAssets: true,
}));

(async () => {
  await Promise.all([
    build({
      configFile: 'vite.config.ts',
      build: {
        rollupOptions: {
          input: resolveEntries().reduce<Record<string, string>>((acc, item) => {
            acc[item.name] = item.path;
            return acc;
          }, {}),
        },
      },
    }),
    ...libs.map((lib) => build({
      configFile: 'vite.content.config.ts',
      build: {
        lib,
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name]-[hash][extname]',
          },
        },
      },
    })),
  ]);
})();
