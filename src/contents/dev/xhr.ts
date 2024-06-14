import { RESPONSE_MESSAGE } from '@src/common';

interface Payload {
  url: string,
  data: unknown
}

interface Listener {
  (payload: Payload): void;
}

export class Xhr {
  private static instance: Xhr | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Xhr();
    }
    return this.instance;
  }

  private listeners: { [key: string]: Array<Listener> } = {};

  private constructor() {
    window.addEventListener('message', (event: MessageEvent<{
      type: string,
      payload: Payload
    }>) => {
      // We only accept messages from ourselves
      if (event.source !== window) {
        return;
      }

      if (event?.data?.type !== RESPONSE_MESSAGE) {
        return;
      }

      const { url } = event.data.payload || {};

      if (!url) return;

      this.trigger(url, event.data.payload);
    }, false);
  }

  private trigger(url: string, payload: Payload) {
    const u = new URL(url);
    const key = u.pathname;
    const listeners = this.listeners[key] || [];
    listeners.forEach(listener => listener(payload));
  }

  on(key: string, listener: Listener) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(listener);
  }

  once(key: string, listener: Listener) {
    const fn = (payload: Payload) => {
      listener(payload);
      this.off(key, fn);
    };
    this.on(key, fn);
  }

  off(key: string, listener: Listener) {
    const listeners = this.listeners[key] || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}
