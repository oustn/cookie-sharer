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

export interface SyncCookieOptions {
    rewritePath?: boolean;
}

export async function syncCookieByUrl(target: string, source: string, options: SyncCookieOptions = {}) {
    if (!target || !source) return

    const domain = resolveHostname(target)
    const targetUrl = new URL(target)

    const cookies = await getCookie(source)

    if (!cookies || !cookies.length) {
        return
    }

    const results = await Promise.allSettled(cookies.map((cookie) => {
        const rest = { ...cookie }
        Reflect.deleteProperty(rest, 'hostOnly')
        Reflect.deleteProperty(rest, 'session')
        Reflect.deleteProperty(rest, 'secure')
        Reflect.deleteProperty(rest, 'sameSite')
        if (!rest.name || !rest.value) {
            return Promise.resolve(null)
        }

        // 如果开启了路径重写，将 path 统一设置为 /
        // 否则保留 cookie 原始 path，并将 set 用的 url 调整为带该 path 的完整地址，确保匹配
        let cookiePath = rest.path || '/'
        let setUrl: string
        if (options.rewritePath) {
            cookiePath = '/'
            setUrl = target
        } else if (cookiePath !== '/' && !targetUrl.pathname.startsWith(cookiePath)) {
            // path 与目标 URL 不匹配：用 target 的 origin + cookie path 构造匹配的 url
            console.warn(
                `[cookie-sharer] Cookie "${rest.name}" 的 path "${cookiePath}" 与目标 URL "${targetUrl.pathname}" 不匹配，` +
                `已使用 "${targetUrl.origin + cookiePath}" 作为设置地址。` +
                `可在配置中开启「重写路径」以统一将 path 重写为 /。`
            )
            setUrl = targetUrl.origin + cookiePath
        } else {
            setUrl = target
        }

        const data = {
            ...rest,
            domain: domain!,
            path: cookiePath,
        }
        return chrome.cookies.set({
            ...data,
            url: setUrl,
        })
    }))

    // 将设置失败的 cookie 打印出来，避免静默失败
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(
                `[cookie-sharer] Cookie "${cookies[index]?.name}" 设置失败:`,
                result.reason
            )
        }
    })

    return results
}

export async function syncCookieBySources(target: string, sources: string[], options: SyncCookieOptions = {}) {
    if (!target || !Array.isArray(sources) || !sources.length) return
    await Promise.all(sources.map(source => syncCookieByUrl(target, source, options)))
}
