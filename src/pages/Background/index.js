import {syncCookie, syncCookieBySources} from '../../common/sync-cookie';
import {resolveCookieSources} from '../../common/helper';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== "install" && details.reason !== "update") return;
    // chrome.contextMenus.create({
    //     "id": "sampleContextMenu",
    //     "title": "Sample Context Menu",
    //     "contexts": ["selection"]
    // });
});

chrome.cookies.onChanged.addListener((cookie) => {
    console.log(cookie, 'cookie')
})


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const {status, url} = changeInfo
    if (status !== 'loading') {
        return
    }
    const result = await resolveCookieSources(url || tab.url)
    if (!result || !result.sources.length) return
    syncCookieBySources(result.url, result.sources).then(() => {
        console.log(`sync cookie for ${result.url} from ${result.sources} success`)
    }).catch((e) => {
        console.log(`sync cookie for ${result.url} from ${result.sources} fail`, e)
    })
})

/**
 * 配置变更时同步一次 cookie
 */
chrome.storage.onChanged.addListener(() => {
    syncCookie().then(() => {
        console.log('sync cookie success')
    }).catch((e) => {
        console.log('sync cookie fail', e)
    })
})
