import {Runtime} from "../../state/runtime"

const runtime = new Runtime()

runtime.syncCookie(result => result.then(() => {
    console.log(`sync cookie for ${runtime.host} from ${runtime.sources} success`)
}).catch((e) => {
    console.log(`sync cookie for ${runtime.host} from ${runtime.sources} fail`, e)
}))

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const {status} = changeInfo

    if (status !== 'loading') {
        return
    }
    // 重新加载 url / config
    runtime.init()
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // 重新加载 url / config
    runtime.init()
})


/**
 * 配置变更时同步一次 cookie
 */
// chrome.storage.onChanged.addListener(() => {
//     syncCookie().then(() => {
//         console.log('sync cookie success')
//     }).catch((e) => {
//         console.log('sync cookie fail', e)
//     })
// })
