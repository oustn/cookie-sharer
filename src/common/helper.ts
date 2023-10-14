import {STORAGE_KEY} from "./constant";
import {Config} from "@src/types";

export function resolveBasicUrl(url: string) {
    if (!url) {
        return null;
    }
    return new URL(url).origin;
}

export function resolveUrls(url: string) {
    if (!url) {
        return null;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return [new URL(url).origin];
    }
    return [
        new URL(`http://${url}`).origin,
        new URL(`https://${url}`).origin,
    ]
}

export function resolveHostname(url: string) {
    const urls = resolveUrls(url);
    if (!urls) {
        return null;
    }
    return new URL(urls[0]).hostname;
}

export async function resolveConfig(): Promise<Config> {
    const res = await chrome.storage.sync.get(STORAGE_KEY);
    if (res && res[STORAGE_KEY]) {
        return res[STORAGE_KEY];
    }
    return {
        rules: {},
    }
}

export function updateConfig(config: Config) {
    return chrome.storage.sync.set({
        [STORAGE_KEY]: config,
    })
}

export async function resolveCookieSources(url: string) {
    const config = await resolveConfig();
    const {rules} = config;
    const data = []
    const basicUrl = resolveBasicUrl(url);
    if (!rules || !basicUrl) return null;

    for (const [source, targets] of Object.entries(rules)) {
        if (!Array.isArray(targets)) continue;
        for (const target of targets) {
            const urls = resolveUrls(target);
            if (!urls) continue;
            if (urls.includes(basicUrl)) {
                data.push(source);
            }
        }
    }

    return {
        url: basicUrl,
        sources: data,
    };
}

export async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true};
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export async function updateExtensionIcon(icon: string) {
    return chrome.action.setIcon({
        path: `${icon}.png`,
    })
}

export async function setDefaultIcon() {
    await updateExtensionIcon('cookie-base');
}

export async function setTargetIcon() {
    await updateExtensionIcon('cookie-target');
}

export async function setSourceIcon() {
    await updateExtensionIcon('cookie-source');
}
