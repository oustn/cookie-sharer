import { Action, RenderAction } from './base.ts';
import { URLSearchParams } from 'node:url';

interface Page {
  type: string;
  pageID: string;
  pageUrl: string;
}

class ListAction extends Action {
  private pages: Array<Page> = [];

  injectTarget = '.mp-grid-row-toolbar';

  isTarget(path: string, search: URLSearchParams): boolean {
    return path === '/modeling/page' && search.get('pagetype') === 'mobile';
  }

  async wait() {
    await super.wait();

    return new Promise((resolve) => {
      this.xhr.once('/ajax/Mysoft.Map6.Modeling.Handlers.PageHandler/LoadPages', (data) => {
        this.pages = (data.data as { data: Array<Page> }).data;
        resolve(null);
      });
    });
  }

  get renderActions(): Array<RenderAction> | RenderAction {
    const result = [];
    if (this.target?.dev) {
      result.push({
        name: '开发',
        execute: (index: number) => {
          this.handleToDev(index);
        },
      });
    }
    if (this.target?.preview) {
      result.push({
        name: '预览',
        execute: (index: number) => {
          this.handleToPreview(index);
        },
      });
    }
    return result;
  }

  handleToDev(index: number) {
    const page = this.pages[index];
    if (!page) return;
    switch (page.type) {
      case '列表页面':
        this.openControlDesigner('AppGrid', page.pageID, this.target?.dev ?? '');
        break;
      case '表单页面':
        this.openControlDesigner('AppForm', page.pageID, this.target?.dev ?? '');
        break;
      case '详情页面':
        this.openControlDesigner('', page.pageID, this.target?.dev ?? '');
        break;
    }
  }

  handleToPreview(index: number) {
    const page = this.pages[index];
    if (!page) return;
    this.dispatchOpen(`${this.target?.preview ?? ''}${page.pageUrl}`);
  }

  private openControlDesigner(controlType: string, pageID: string, origin: string) {
    const url = `${origin}/mobile/#/page/${pageID}${controlType ? '?controlType=' + controlType : ''}`;
    this.dispatchOpen(url);
  }
}

export const listAction = new ListAction();
