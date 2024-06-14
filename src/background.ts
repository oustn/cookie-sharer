import { Runtime } from '@src/core';
import { onStorageChanged, resolveConfig } from '@src/common';
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
    matches: hosts.map(host => `${host}/modeling/*`),
  }));
}

async function registerContentScripts(rules: Record<string, Target[]>) {
  await unregisterAllDynamicContentScripts();
  console.log('unregisterAllDynamicContentScripts');
  if (!Array.isArray(contentScripts) || !contentScripts.length) {
    return;
  }
  const hosts = Object.keys(rules);
  if (!hosts.length) return;
  await chrome.scripting.registerContentScripts(generateContentScriptOptions(hosts));
  console.log('registerContentScripts');
}

onStorageChanged(registerContentScripts);

resolveConfig().then(config => registerContentScripts(config.rules))
