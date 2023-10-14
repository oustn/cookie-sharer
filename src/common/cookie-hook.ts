import React from 'react'
import {getCookie} from "@src/common";

export function CookieHook(url: string) {
    const [cookies, setCookie] = React.useState<chrome.cookies.Cookie[]>([])

    React.useEffect(() => {
        getCookie(url).then((cookie) => {
            if (cookie && Array.isArray(cookie) && cookie.length) {
                setCookie(cookie)
            }
        })
    }, [])

    return cookies
}
