import { CONFIG_CHANGE_EVENT, OPEN_EVENT, RESPONSE_MESSAGE, SPY_ID, URL_CHANGE_MESSAGE } from '@src/common';
import { MyXMLHttpRequest } from './xhr';

interface Payload {
  location: string,
  action: string,
  path: string,
  prevPath: string,
  hash: string,
  prevHash: string
  prevQuery: string
  query: string
}

type Handler = (event: Payload) => void;

class RouteListener {
  currentPath: string;
  currentHash: string;
  currentQuery: string;

  constructor(private readonly handler: Handler) {
    this.currentPath = window.location.pathname;
    this.currentHash = window.location.hash;
    this.currentQuery = window.location.search;
    this.init();
  }

  init() {
    // Listen for popstate and hashchange events
    window.addEventListener('popstate', () => this.onRouteChange('popstate'));
    window.addEventListener('hashchange', () => this.onRouteChange('hashchange'));

    // Override pushState and replaceState to listen for these methods
    this.overrideHistoryMethods();
    this.onRouteChange();
  }

  onRouteChange(action?: string) {
    const newPath = window.location.pathname;
    const newHash = window.location.hash;
    const newQuery = window.location.search;

    if (!action || newPath !== this.currentPath || newHash !== this.currentHash || newQuery !== this.currentQuery) {
      this.handler({
        location: window.location.href,
        action: action ?? 'init',
        prevPath: this.currentPath ?? '',
        prevHash: this.currentHash ?? '',
        prevQuery: this.currentQuery ?? '',
        path: newPath ?? '',
        hash: newHash ?? '',
        query: newQuery ?? '',
      });
      this.currentPath = newPath;
      this.currentHash = newHash;
      this.currentQuery = newQuery;
    }
  }

  overrideHistoryMethods() {
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;

    window.history.pushState = (...args: Parameters<typeof pushState>) => {
      const result = pushState.apply(history, args);
      this.onRouteChange('pushState');
      return result;
    };

    window.history.replaceState = (...args: Parameters<typeof pushState>) => {
      const result = replaceState.apply(history, args);
      this.onRouteChange('replaceState');
      return result;
    };
  }
}

const handler = (payload: Payload) => {
  window.postMessage({
    type: URL_CHANGE_MESSAGE,
    payload,
  }, '*');
};
// Create an instance of RouteListener to start listening for route changes
new RouteListener(handler);

const spy = document.getElementById(SPY_ID);
if (spy) {
  spy.addEventListener(CONFIG_CHANGE_EVENT, () => {
    window.location.reload();
  });

  spy.addEventListener(OPEN_EVENT, (e: Event) => {
    window.open((e as unknown as CustomEvent)?.detail?.url, '_blank');
  });
}

MyXMLHttpRequest.use({
  response(xhr, response) {
    if (response?.headers.get('content-type')?.includes('application/json')) {
      response.json().then((data) => {
        window.postMessage({
          type: RESPONSE_MESSAGE,
          payload: {
            url: xhr.responseURL,
            data,
          },
        });
      });
    }
  },
});
