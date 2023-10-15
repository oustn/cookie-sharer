import {resolve, basename, extname} from "node:path";
import type {Plugin} from 'vite'
import _ from 'lodash'
import Manifest from "../manifest.json"

export function resolveEntries() {
    const entries: { key: string, value: string, name: string, path: string }[] = [];

    function walk(value: unknown, path = '') {
        if (_.isPlainObject(value)) {
            _.forOwn(value, (value, key) => {
                walk(value, path ? `${path}.${key}` : key)
            })
        } else if (_.isString(value) && (_.endsWith(value, '.html') || _.endsWith(value, '.ts'))) {
            entries.push({
                key: path,
                value,
                name: basename(value).replace(/\.(html|ts)$/, ''),
                path: resolve(__dirname, '..', value)
            })
        } else if (_.isArray(value)) {
            value.forEach((value, index) => {
                walk(value, path ? `${path}.${index}` : `${index}`)
            })
        }
    }

    walk(Manifest)

    return entries
}

export function ChromeExtensionManifestPlugin(): Plugin {
    const manifest: chrome.runtime.ManifestV3 = JSON.parse(JSON.stringify(Manifest))

    if (process.env.COOKIE_RELEASE_VERSION) {
        manifest.version = process.env.COOKIE_RELEASE_VERSION
    }

    return {
        name: 'vite-plugin-chrome-extension-manifest',

        generateBundle(__, bundle) {
            const icons = []
            const entries = resolveEntries()

            for (const file in bundle) {
                const chunk = bundle[file]
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    const {facadeModuleId, name} = chunk
                    const entry = entries.find(item => item.path === facadeModuleId)
                    if (entry) {
                        _.set(manifest, entry.key, extname(facadeModuleId) === '.html' ? `${name}.html` : `${name}.js`)
                    }
                } else if (chunk.type === 'asset' && typeof chunk.fileName === 'string' && chunk.fileName.startsWith('icons/')) {
                    icons.push(chunk.fileName)
                }
            }

            manifest.icons = icons.reduce<Record<string, string>>((acc, item) => {
                const match = /icons\/icon(.+)\.png$/.exec(item)
                if (match) {
                    acc[match[1]] = item
                }
                return acc
            }, {})

            manifest.action.default_icon = manifest.icons['16']

            this.emitFile({
                fileName: 'manifest.json',
                type: 'asset',
                source: JSON.stringify(manifest, null, 2),
            })
        },
    }
}
