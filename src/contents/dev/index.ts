import {
  CONFIG_CHANGE_EVENT,
  onStorageChanged,
  RESOLVE_STORAGE,
  resolveConfig,
  SPY_ID, SYNC_STORAGE,
  URL_CHANGE_MESSAGE,
} from '@src/common';
import { process } from './actions';

import './index.scss';

const spy = document.createElement('div');
spy.id = SPY_ID;
spy.style.display = 'none';
spy.setAttribute('version', chrome.runtime.getManifest().version);
document.body.appendChild(spy);

const injectScript = (file: string, node: string) => {
  const th = document.querySelector(node);
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th?.appendChild(s);
};
injectScript(chrome.runtime.getURL('inject.js'), 'body');

onStorageChanged(() => {
  const event = new Event(CONFIG_CHANGE_EVENT);
  spy.dispatchEvent(event);
});

window.addEventListener('message', (event: MessageEvent<{
  type: string,
  payload: { path: string, query: string }
}>) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event?.data?.type !== URL_CHANGE_MESSAGE) {
    return;
  }

  const { path, query } = event.data.payload || {};

  launch(path, query);
}, false);

function launch(path: string, query: string) {
  console.log('🚀');
  process(path, query);
}

async function resolveStorage() {
  return new self.Promise((resolve) => {
    const fn = (event: MessageEvent<{
      type: string,
      payload: { local: Record<string, unknown>, session: Record<string, unknown> }
    }>) => {
      window.removeEventListener('message', fn)
      // We only accept messages from ourselves
      if (event.source !== window) {
        return;
      }

      if (event?.data?.type !== RESOLVE_STORAGE) {
        return;
      }

      const data = event.data.payload || {};
      resolve(data)
    }

    window.addEventListener('message', fn)
    const event = new Event(RESOLVE_STORAGE);
    spy.dispatchEvent(event);
  })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === RESOLVE_STORAGE) {
    console.log('Resolve storage message for', message.target)
    resolveStorage().then(data => sendResponse(data))
    return true
  }
});

(async () => {
  const host = window.location.origin;
  const config = await resolveConfig()
  if (host in config.rules) {
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const source = Object.entries(config.rules).find(([_, value]) => {
    return value.find(u => u.host === host &&  u.activated)
  })?.[0]
  if (!source) return
  console.log(`Current host: ${host}, source: ${source}`, `Try to resolve ${source} storages`)
  const storages = chrome.runtime.sendMessage({ type: RESOLVE_STORAGE, site: host, data: { source } });
  storages.then(data => {
    if (data) {
      const event = new CustomEvent(SYNC_STORAGE, {
        detail: data
      });
      spy.dispatchEvent(event);
    }
  }).catch((e) => {
    console.log(`Resolve storage failed: ${e.message}`)
  })
})();
