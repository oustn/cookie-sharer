import { Action, RenderAction } from './base.ts';

interface Metadata {
  url: string;
}

class DesignerAction extends Action {
  private metadata: Metadata | null = null;

  injectTarget = '.header-right .btns';

  get renderActions(): RenderAction | RenderAction[] {
    if (!this.target?.preview) return [];
    return {
      name: '预览',
      execute: () => {
        this.handleViewDev();
      },
    };
  }

  isTarget(path: string): boolean {
    return path === '/modeling/mobile-designer/index';
  }

  async wait(): Promise<unknown> {
    await super.wait();

    return new Promise((resolve) => {
      this.xhr.once('/ajax/Mysoft.Map6.Modeling.Handlers.Metadatas.MetadataAjaxHandler/GetMobileFunctionPageMetadata', (data) => {
        this.metadata = (data.data as { item: Metadata }).item;
        setTimeout(() => {
          resolve(null);
        }, 100);
      });
    });
  }

  private handleViewDev() {
    if (!this.metadata) return;
    this.dispatchOpen(`${this.target?.preview ?? ''}${this.metadata.url}`);
  }
}

export const designerAction = new DesignerAction();
