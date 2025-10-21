import { resolveBasicUrl, resolveHostname } from './helper';

export async function getCookie(url: string) {
    if (!url) return null
    const basicUrl = resolveBasicUrl(url)
    const hostname = resolveHostname(url)
    return (await Promise.all([
        basicUrl ? chrome.cookies.getAll({ url: basicUrl, }) : [],
        hostname ? chrome.cookies.getAll({ domain: hostname }) : [],
    ])).flat()
}

export async function syncCookieByUrl(target: string, source: string) {
    if (!target || !source) return

    const domain = resolveHostname(target)

    const cookies = await getCookie(source)

    if (!cookies || !cookies.length) {
        return
    }

    return Promise.all(cookies.map((cookie) => {
        const rest = { ...cookie }
        Reflect.deleteProperty(rest, 'hostOnly')
        Reflect.deleteProperty(rest, 'session')
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
