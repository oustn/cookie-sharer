import { CONFIG_CHANGE_EVENT, onStorageChanged, SPY_ID, URL_CHANGE_MESSAGE } from '@src/common';
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
