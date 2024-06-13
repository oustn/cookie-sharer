import { extname } from 'node:path';
import type { Plugin } from 'vite';
import _ from 'lodash';
import Manifest from '../manifest.json';
import { cleanArray, resolveEntries } from '../lib/utils';

export function ChromeExtensionManifestPlugin(): Plugin {
    const manifest: chrome.runtime.ManifestV3 = JSON.parse(JSON.stringify(Manifest));

    if (process.env.EXTENSION_RELEASE_VERSION) {
        manifest.version = process.env.EXTENSION_RELEASE_VERSION;
    }

    return {
        name: 'vite-plugin-chrome-extension-manifest',

        enforce: 'post',

        generateBundle(__, bundle) {
            const icons = [];
            const entries = resolveEntries();

            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    const ref = chunk.imports[0];
                    if (ref.includes('preload-helper-')) {
                        const refChunk = bundle[ref];
                        if (refChunk.type === 'chunk') {
                            const refCode = refChunk.code;
                            const regexp = new RegExp(`import{_ as (\\w)}from".*${ref.split('/').pop()}";`, 'g');
                            const match = regexp.exec(chunk.code);
                            const refMatch = refCode.match(/export{(\w) as _};/);
                            const [, f] = match;
                            const [, r] = refMatch;
                            chunk.code = chunk.code.replace(regexp, refCode.replace(/export{(\w) as _};/, `const __${f} = ${r};`)).replace(new RegExp(`${f}\\(\\(\\)=>import`, 'g'), `__${f}(()=>import`);
                        }
                    }
                    const { facadeModuleId, name } = chunk;
                    const entry = entries.find(item => item.path === facadeModuleId);
                    if (entry) {
                        _.set(manifest, entry.key, extname(facadeModuleId) === '.html' ? `${name}.html` : `${name}.js`);
                        if (entry.withCss) {
                            _.set(manifest, entry.key.replace('js', 'css'), chunk.viteMetadata.importedCss.values().next().value);
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

            cleanArray(manifest)

            this.emitFile({
                fileName: 'manifest.json',
                type: 'asset',
                source: JSON.stringify(manifest, null, 2),
            });

            const contentScripts = _.get(manifest, 'web_accessible_resources', [])
              .map((d: { resources: string[]; }) => d.resources).flat().concat(
                ..._.get(manifest, 'content_scripts', []).map((d: { js: string[]; }) => d.js),
              );

            contentScripts.forEach((file: string) => {
                Reflect.deleteProperty(bundle, file);
            });
        },
    };
}
