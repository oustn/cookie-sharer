import React from 'react'
import {getCurrentTab} from "./helper";

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
