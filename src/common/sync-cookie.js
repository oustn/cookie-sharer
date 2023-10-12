import {STORAGE_KEY} from "./constant";

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
