import {STORAGE_KEY} from "./constant";
import {resolveBasicUrl, resolveHostname} from "./helper";

async function getCookie(url: string) {
    if (!url) return null
    const basicUrl = resolveBasicUrl(url)
    if (!basicUrl) return null
    return chrome.cookies.getAll({
        url: basicUrl,
    })
}

export async function syncCookieByUrl(target: string, source: string) {
    if (!target || !source) return

    const domain = resolveHostname(target)

    const cookies = await getCookie(source)

    if (!cookies || !cookies.length) {
        return
    }

    return Promise.all(cookies.map(({hostOnly, session, ...rest}) => {
        if (!rest.name || !rest.value) {
            return [Promise.resolve()]
        }
        const data = {
            ...rest,
            domain: domain!,
        }
        return chrome.cookies.set({
            ...data,
            url: target,
        })
    }))
}

export async function syncCookieBySources(target: string, sources: string[]) {
    if (!target || !Array.isArray(sources) || !sources.length) return
    await Promise.all(sources.map(source => syncCookieByUrl(target, source)))
}
