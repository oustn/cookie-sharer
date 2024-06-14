// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Copy from 'clipboard/src/actions/copy';
import { Action, RenderAction } from './base';

class PreviewAction extends Action {
  injectTarget: string = '.mobile-header_right';

  get renderActions(): RenderAction | RenderAction[] {
    const data: Array<RenderAction> = [
      {
        name: '复制地址',
        execute: () => {
          this.handleCopy();
        },
      },
    ];
    if (this.target?.preview) {
      data.push({
        name: '开发预览',
        execute: () => {
          this.handleToDev();
        },
      });
    }
    return data;
  }

  isTarget(path: string): boolean {
    return path.includes('/modeling/mobile/preview/');
  }

  async wait(): Promise<unknown> {
    await super.wait();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 100);
    });
  }

  private getUrl() {
    const iframe = document.querySelector('iframe');
    return iframe?.src ?? '';
  }

  private handleCopy() {
    const url = this.getUrl();
    if (!url) return;

    Copy(url);
  }

  private handleToDev() {
    const url = this.getUrl();
    if (!url) return;
    this.dispatchOpen(`${this.target?.preview ?? ''}${new URL(url).pathname}`);
  }
}

export const previewAction = new PreviewAction();
