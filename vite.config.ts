import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

import {ViteIconPlugin, resolveEntries, ChromeExtensionManifestPlugin} from './plugins'
import path from "node:path";

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
