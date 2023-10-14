import type {Plugin} from 'vite';
import type {PluginContext} from 'rollup';
import favicons from 'favicons';
import path from 'node:path';

function generateIcons(name: string) {
    return [
        {
            name: "favicon-16x16.png",
            real: `${name}16.png`,
        },
        {
            name: "favicon-32x32.png",
            real: `${name}32.png`,
        },
        {
            name: "favicon-48x48.png",
            real: `${name}48.png`,
        },
        {
            name: "favicon.svg",
            real: `${name}128.png`,
            sizes: [
                {
                    width: 128,
                    height: 128,
                },
            ],
        }
    ].map((item) => {
        let read = false
        return new Proxy(item, {
            get(target, key) {
                if (key !== 'name') {
                    return Reflect.get(target, key);
                }
                if (read && target.real) {
                    return target.real
                }
                read = true
                return target.name
            },
        })
    })
}

export type ViteIconPluginOptions = {
    icon?: string,
    name?: string,
    projectRoot?: string,
}

export const ViteIconPlugin = (options: ViteIconPluginOptions = {}): Plugin => {
    const lOptions = typeof options === 'string' ? {icon: options} : options;
    lOptions.projectRoot = lOptions.projectRoot === undefined ? process.cwd() : lOptions.projectRoot;
    const LOGO_PATH = path.resolve(lOptions.icon || path.join('assets', 'logo.png'));

    const getFavicons = async () => {
        return await favicons(LOGO_PATH, {
            icons: {
                android: false,
                appleIcon: false,
                appleStartup: false,
                favicons: generateIcons(lOptions.name || 'icon') as unknown as string[],
                windows: false,
                yandex: false,
            },
        });
    };

    const assetIds: Map<string, string> = new Map();

    const rebuildIcon = async (ctx: PluginContext) => {
        ctx.addWatchFile(LOGO_PATH);
        const res = await getFavicons();
        for (const {name, contents} of res.files) {
            assetIds.set(name, ctx.emitFile({type: 'asset', fileName: name, source: contents}));
        }
        for (const {name, contents} of res.images) {
            assetIds.set(name, ctx.emitFile({type: 'asset', fileName: `icons/${name}`, source: contents}));
        }
    };

    return {
        name: 'vite-plugin-icon',
        async buildStart() {
            await rebuildIcon(this);
        },
    };
};
