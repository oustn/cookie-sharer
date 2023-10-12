import React from 'react'

async function getCurrentTab() {
    console.log('....tab')
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export function HostHook() {
    const [host, updateHost] = React.useState('')

    React.useEffect(() => {
        getCurrentTab().then((tab) => {
            if (tab) {
                try {
                    const url = new URL(tab.url)
                    if (url.protocol === 'http:' || url.protocol === 'https:') {
                        updateHost(url.origin)
                    }
                } catch (e) {
                    // do nothing
                }
            }
        })
    }, [])

    return host
}
