import { STORAGE_KEY } from './constant';
import { Config, Target } from '@src/types';

export function resolveBasicUrl(url: string) {
  if (!url) {
    return null;
  }
  return new URL(url).origin;
}

export function resolveUrls(url: string) {
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return [new URL(url).origin];
  }
  return [
    new URL(`http://${url}`).origin,
    new URL(`https://${url}`).origin,
  ];
}

export function resolveHostname(url: string) {
  const urls = resolveUrls(url);
  if (!urls) {
    return null;
  }
  return new URL(urls[0]).hostname;
}

export async function resolveConfig(): Promise<Config> {
  const res = await chrome.storage.sync.get(STORAGE_KEY);
  if (res && res[STORAGE_KEY]) {
    return res[STORAGE_KEY];
  }
  return {
    rules: {},
  };
}

export function updateConfig(config: Config) {
  return chrome.storage.sync.set({
    [STORAGE_KEY]: config,
  });
}

export async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export async function updateExtensionIcon(icon: string, badge = '') {
  await chrome.action.setIcon({
    path: `icons/${icon}16.png`,
  });
  await chrome.action.setBadgeText({
    text: badge,
  });
}

export function onStorageChanged(callback: (rules: Record<string, Array<Target>>) => void) {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }
    if (!(STORAGE_KEY in changes)) {
      return;
    }
    callback((changes[STORAGE_KEY].newValue as Config).rules);
  });
}

export function goto(url: string, inactive: boolean = false) {
  return chrome.tabs.create({ url, active: !inactive });
}
