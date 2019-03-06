const Router = require('./Router');
const debug = require('../helpers/debug');
const makeUrl = require('./makeUrl');

class RoutesConfig {
  constructor() {
    /** @private */
    this.middlewares = [];

    /**
     * @private
     * @type {{url: string, index: number, router: Router}[]}
     */
    this.routes = [];
  }

  /**
   * @param {function|string} functionOrUrl
   * @param {Router} [router] ignored if 1st argument is a function
   * @throws Error on invalid arguments
   */
  add(functionOrUrl, router) {
    if (typeof functionOrUrl === 'function') {
      debug('Adding middleware function');
      this.middlewares.push(functionOrUrl);
      return;
    }

    if (typeof functionOrUrl === 'string' && router instanceof Router) {
      if (functionOrUrl.length === 0) {
        throw new Error('URL cannot be empty');
      }

      debug('Adding router');
      this.routes.push({
        url: functionOrUrl,
        router,
        index: this.middlewares.length
      });

      return;
    }

    throw new Error('Incorrect middleware');
  }

  /**
   * @return {Array<{method: string, url: string, handlers: function[], headers: string[]}>}
   */
  listRoutes() {
    return this.routes.flatMap(router => {
      const beforeMiddleware = this.middlewares.slice(0, router.index);
      const afterMiddleware = this.middlewares.slice(router.index);

      return router.router.listHandlers().map(({method, url, handler}) => {
        return {
          method,
          url: makeUrl([router.url, url]),
          handlers: [...beforeMiddleware, handler, ...afterMiddleware]
        };
      });
    });
  }
}

module.exports = RoutesConfig;