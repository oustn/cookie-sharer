import { extname } from 'node:path';
import type { Plugin } from 'vite';
import _ from 'lodash';
import Manifest from '../manifest.json';
import { cleanArray, resolveEntries } from '../lib/utils';

export { resolveEntries };

function transformDynamicContentScripts(contentScripts: Map<string, string>) {
  const result = [];
  contentScripts.forEach((value, key) => {
    if (!value) return;
    const reg = /content_scripts\.(\d+)\.(js|css)\.(\d+)/;
    const match = reg.exec(key);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [__, index, type, subIndex] = match;
      const i = Number(index);
      const s = Number(subIndex);
      if (!result[i]) {
        result[i] = { js: [], css: [] };
      }
      if (type === 'js') {
        result[i].js[s] = value;
      } else if (type === 'css') {
        result[i].css[s] = value;
      }
    }
  })
  return JSON.stringify(result);
}

export function ChromeExtensionManifestPlugin(): Plugin {
  return {
    name: 'vite-plugin-chrome-extension-manifest',

    enforce: 'post',

    generateBundle(__, bundle) {
      const manifest: chrome.runtime.ManifestV3 = JSON.parse(JSON.stringify(Manifest));

      if (process.env.EXTENSION_RELEASE_VERSION) {
        manifest.version = process.env.EXTENSION_RELEASE_VERSION;
      }

      const icons = [];
      const entries = resolveEntries();

      const contentScriptMap = new Map<string, string>();

      for (const file in bundle) {
        const chunk = bundle[file];
        if (chunk.type === 'chunk' && chunk.isEntry) {
          const { facadeModuleId, name } = chunk;
          const entry = entries.find(item => item.path === facadeModuleId);
          if (entry) {
            const chunkName = extname(facadeModuleId) === '.html' ? `${name}.html` : `${name}.js`;
            _.set(manifest, entry.key, chunkName);
            if (entry.key.includes('content_scripts')) {
              contentScriptMap.set(entry.key, chunkName);
            }
            if (entry.withCss) {
              const cssChunkName = chunk.viteMetadata.importedCss.values().next().value;
              const cssKey = entry.key.replace('js', 'css');
              _.set(manifest, cssKey, cssChunkName);
              if (entry.key.includes('content_scripts')) {
                contentScriptMap.set(cssKey, cssChunkName);
              }
            }
          }
        } else if (chunk.type === 'asset' && typeof chunk.fileName === 'string' && chunk.fileName.startsWith('icons/')) {
          icons.push(chunk.fileName);
        }
      }

      manifest.icons = icons.reduce<Record<string, string>>((acc, item) => {
        const match = /icons\/icon(.+)\.png$/.exec(item);
        if (match) {
          acc[match[1]] = item;
        }
        return acc;
      }, {});

      if (manifest.action) {
        manifest.action.default_icon = manifest.icons['16'];
      }

      cleanArray(manifest);

      const contentScripts = _.get(manifest, 'web_accessible_resources', [])
        .map((d: { resources: string[]; }) => d.resources).flat().concat(
          ..._.get(manifest, 'content_scripts', []).map((d: { js: string[]; }) => d.js),
        );

      contentScripts.forEach((file: string) => {
        Reflect.deleteProperty(bundle, file);
      });

      const contents = _.get(manifest, 'content_scripts', []);

      if (contents.length) {
        const filterContents = contents.filter(d => !d.dynamic);
        if (filterContents.length) {
          _.set(manifest, 'content_scripts', filterContents);
        } else {
          Reflect.deleteProperty(manifest, 'content_scripts');
        }
      }

      const backgroundFile = _.get(manifest, 'background.service_worker', '');
      const chunk = bundle[backgroundFile];
      if (chunk.type === 'chunk' && chunk.isEntry) {
        chunk.code = `const contentScripts = ${transformDynamicContentScripts(contentScriptMap)};${chunk.code}`;
      }

      this.emitFile({
        fileName: 'manifest.json',
        type: 'asset',
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}
