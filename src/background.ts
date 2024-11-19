import { Runtime } from '@src/core';
import { onStorageChanged, RESOLVE_STORAGE, resolveConfig } from '@src/common';
import { Target } from '@src/types';

declare const contentScripts: Array<{ js: Array<string>, css: Array<string> }>;

const runtime = Runtime.getInstance();

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  const { status } = changeInfo;

  if (status !== 'loading') {
    return;
  }
  // 重新加载 url / config
  runtime.init();
});

chrome.tabs.onActivated.addListener(async () => {
  // 重新加载 url / config
  runtime.init();
});

async function unregisterAllDynamicContentScripts() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const scriptIds = scripts.map(script => script.id);
    return chrome.scripting.unregisterContentScripts({
      ids: scriptIds,
    });
  } catch (error) {
    const message = [
      'An unexpected error occurred while',
      'unregistering dynamic content scripts.',
    ].join(' ');
    console.log(error);
    throw new Error(message);
  }
}

// /modeling/mobile-designer
// /modeling/page?pagetype=mobile
// /modeling/mobile/preview/

function generateContentScriptOptions(hosts: Array<string>): chrome.scripting.RegisteredContentScript[] {
  return contentScripts.map((content, index) => ({
    ...content,
    id: `content-script-${index + 1}`,
    runAt: 'document_end',
    matches: hosts.map(host => `${host}/*`),
  }));
}

async function registerContentScripts(rules: Record<string, Target[]>) {
  await unregisterAllDynamicContentScripts();
  console.log('unregisterAllDynamicContentScripts');
  if (!Array.isArray(contentScripts) || !contentScripts.length) {
    return;
  }
  const hosts = Object.keys(rules);
  const targets = Object.values(rules).flat().filter(d => d.activated).map(d => d.host)
  if (!hosts.length) return;
  await chrome.scripting.registerContentScripts(generateContentScriptOptions([...hosts, ...targets]));
  console.log('registerContentScripts');
}

onStorageChanged(registerContentScripts);

resolveConfig().then(config => registerContentScripts(config.rules))

async function resolveStorage(host: string, site: string) {
  return new self.Promise((resolve) => {
    chrome.tabs.query({ url: `${host}/*` }, async (tabs) => {
      if (tabs.length > 0) {
        console.log('try to resolve tab for storage', host)
        const storage = chrome.tabs.sendMessage(tabs[0].id!, { type: RESOLVE_STORAGE, target: site });
        storage.then(d => resolve(d)).catch(e => {
          console.log('resolve storage error', e)
          resolve(null)
        })
      } else {
        resolve(null)
      }
    });
  })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === RESOLVE_STORAGE) {
    const { source } = message.data || {}
    if (!source) return
    resolveStorage(source, message.site).then(data => sendResponse(data))
    return true
  }
});