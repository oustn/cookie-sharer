interface MiddleWareFn {
  (xhr: XMLHttpRequest, response?: Response): void;
}

interface MiddleWareConfig {
  request?: MiddleWareFn;
  response?: MiddleWareFn;
}

type MiddleWare = MiddleWareConfig | MiddleWareFn

const originalXhr = window.XMLHttpRequest;


export class MyXMLHttpRequest extends originalXhr {
  private static middlewares: MiddleWare[] = [];

  static use(middleware: MiddleWare) {
    this.middlewares.push(middleware);

    return () => {
      const index = this.middlewares.indexOf(middleware);
      if (index > -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  private _onreadystatechange: ((this: XMLHttpRequest, ev: Event) => unknown) | null = null;


  send(body?: Document | XMLHttpRequestBodyInit | null): void {
    this._onreadystatechange = this.onreadystatechange
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    this.onreadystatechange = function(...args) {
      if (this.readyState === 4) {
        const headers = new Headers();
        this.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
          const parts = line.split(': ');
          const key = parts.shift();
          const value = parts.join(': ');
          key && headers.append(key, value);
        });

        const response = new Response(this.response, {
          status: this.status,
          statusText: this.statusText,
          headers: headers,
        });

        MyXMLHttpRequest.middlewares.forEach((middleware) => {
          if (typeof middleware === 'function') {
            middleware(this, response);
          } else {
            (middleware as MiddleWareConfig)?.response?.(this, response);
          }
        });
      }
      if (self._onreadystatechange) {
        self._onreadystatechange.apply(this, args);
      }
    };



    MyXMLHttpRequest.middlewares.forEach((middleware) => {
      if (typeof middleware === 'function') {
        middleware(this);
      } else {
        (middleware as MiddleWareConfig)?.request?.(this);
      }
    });

    super.send(body);
  }
}

window.XMLHttpRequest = MyXMLHttpRequest.bind(window).bind(window)
