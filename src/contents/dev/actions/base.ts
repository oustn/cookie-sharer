import { Xhr } from '../xhr';
import { OPEN_EVENT, resolveConfig, resolveUrls, SPY_ID } from '@src/common';

export interface RenderAction {
  name: string,
  execute: (index: number) => void
}

export abstract class Action {
  protected xhr = Xhr.getInstance();

  abstract injectTarget: string;

  abstract renderActions: Array<RenderAction> | RenderAction;

  abstract isTarget(path: string, search: URLSearchParams): boolean;

  protected target?: { dev: string, preview: string };

  async wait(): Promise<unknown> {
    this.target = await this.getTarget();
    return;
  }

  async postWait() {}

  private async getTarget() {
    const config = await resolveConfig();
    const rules = config.rules;
    if (!rules || !rules[location.origin]) return;
    const rule = rules[location.origin];
    const dev = rule.find(d => d.host.includes(':1234'));
    const preview = rule.find(d => d.host.includes(':5173'));
    return {
      dev: resolveUrls(dev?.host || '')?.[0] ?? '',
      preview: resolveUrls(preview?.host || '')?.[0] ?? '',
    };
  }

  protected dispatchOpen(url: string, options?: Record<string, unknown>) {
    const spy = document.getElementById(SPY_ID);
    if (!spy) return;
    const event = new CustomEvent(OPEN_EVENT, {
      detail: {
        url,
        options,
      },
    });
    spy.dispatchEvent(event);
  }
}

