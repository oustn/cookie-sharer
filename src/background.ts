import {Runtime} from "@src/core"

const runtime = Runtime.getInstance()

runtime.syncCookie(result => result.then(() => {
    console.log(`sync cookie for ${runtime.host} from ${runtime.sources} success`)
}).catch((e) => {
    console.log(`sync cookie for ${runtime.host} from ${runtime.sources} fail`, e)
}))

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
    const {status} = changeInfo

    if (status !== 'loading') {
        return
    }
    // 重新加载 url / config
    runtime.init()
})

chrome.tabs.onActivated.addListener(async () => {
    // 重新加载 url / config
    runtime.init()
})
