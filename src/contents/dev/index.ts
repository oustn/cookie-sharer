import { URL_CHANGE_MESSAGE } from '@src/common';

import './index.scss';

const injectScript = (file: string, node: string) => {
  const th = document.querySelector(node);
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th?.appendChild(s);
};
injectScript(chrome.runtime.getURL('inject.js'), 'body');

window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event?.data?.type !== URL_CHANGE_MESSAGE) {
    return;
  }

  launch();
}, false);

function launch() {
  console.log('🚀');
}

launch();
