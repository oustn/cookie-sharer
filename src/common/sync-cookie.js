import {STORAGE_KEY} from "./constant";
import {resolveBasicUrl, resolveHostname} from "./helper";

async function getCookie(url) {
    if (!url) return null
    const basicUrl = resolveBasicUrl(url)
    if (!basicUrl) return null
    return chrome.cookies.getAll({
        url: basicUrl,
    })
}

export async function syncCookie() {
    const res = await chrome.storage.sync.get(STORAGE_KEY)

    if (!res[STORAGE_KEY]) {
        return;
    }

    const rules = res[STORAGE_KEY].rules || {};

    for (const source of Object.keys(rules)) {
        const targets = rules[source];
        if (!Array.isArray(targets) || !targets.length) {
            continue;
        }
        const cookies = await chrome.cookies.getAll({
            domain: new URL(source).hostname,
        })
        if (!cookies || !cookies.length) {
            continue;
        }
        await Promise.all(targets.map((target) => {
            const host = new URL(/^https?:\/\//.test(target) ? target : `https://${target}`).hostname;
            const urls = !/^https?:\/\//.test(target) ? [
                `http://${target}`,
                `https://${target}`,
            ] : [target]

            return Promise.all(cookies.map(({ hostOnly, session, ...rest }) => {
                if (!rest.name || !rest.value) {
                    return [Promise.resolve()]
                }
                const data = {
                    ...rest,
                    domain: host,
                }
                return urls.map(url => chrome.cookies.set({
                    ...data,
                    url,
                }))
            }).reduce((acc, item) => [...acc, ...item], []))
        }))
    }
}

export async function syncCookieByUrl(target, source) {
    if (!target || !source) return

    const domain = resolveHostname(target)

    const cookies = await getCookie(source)

    if (!cookies || !cookies.length) {
        return
    }

    return Promise.all(cookies.map(({ hostOnly, session, ...rest }) => {
        if (!rest.name || !rest.value) {
            return [Promise.resolve()]
        }
        const data = {
            ...rest,
            domain,
        }
        return chrome.cookies.set({
            ...data,
            url: target,
        })
    }))
}

export async function syncCookieBySources(target, sources) {
    if (!target || !Array.isArray(sources) || !sources.length) return
    return Promise.all(sources.map(source => syncCookieByUrl(target, source)))
}
