import  React from 'react';
import { STORAGE_KEY } from './constant';

export function ConfigHook() {
    const [option, updateOption] = React.useState({
        rules: {},
    })

    React.useEffect(() => {
        chrome.storage.sync.get(STORAGE_KEY).then((res) => {
            if (res[STORAGE_KEY]) {
                updateOption(res[STORAGE_KEY]);
            }
        });

        chrome.storage.onChanged.addListener((changes) => {
            updateOption(changes[STORAGE_KEY].newValue)
        });
    }, []);

    return [option, (opt) => {
        chrome.storage.sync.set({
            [STORAGE_KEY]: opt,
        }).then()
        updateOption(opt)
    }]
}
