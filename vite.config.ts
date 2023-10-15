import path from "node:path";
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import zipPack from "vite-plugin-zip-pack";

import {ViteIconPlugin, resolveEntries, ChromeExtensionManifestPlugin} from './plugins'
import packageJson from './package.json';

const zip = process.env.COOKIE_VERSION

const externalPlugin = []
if (zip) {
    externalPlugin.push(zipPack({
        outDir: './archives',
        outFileName: `${packageJson.name}-${zip}.zip`
    }))
}

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@src": path.resolve(__dirname, "src")
        },
    },
    plugins: [
        react(),
        ...['icon', 'source', 'target'].map(name => ViteIconPlugin({
            icon: `./src/assets/icons/${name}.svg`,
            name,
        })),
        ChromeExtensionManifestPlugin(),
        ...externalPlugin,
    ],

    build: {
        rollupOptions: {
            input: resolveEntries().reduce<Record<string, string>>((acc, item) => {
                acc[item.name] = item.path;
                return acc
            }, {}),
            output: {
                entryFileNames(chunkInfo) {
                    if (/\.html$/.test(chunkInfo.facadeModuleId)) {
                        return 'assets/[name]-[hash:8].js'
                    }
                    return '[name].js'
                },
            },
        }
    }
})
