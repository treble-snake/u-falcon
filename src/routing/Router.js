const makeUrl = require('./makeUrl');

class Router {
  constructor() {
    /**
     * @private
     * @type {RouteDefinition[]}
     */
    this._handlers = [];

    /**
     * @type {{url: string, router: Router}[]}
     * @private
     */
    this._innerRoutes = [];
  }

  /**
   * @param method
   * @param url
   * @param handler
   * @private
   */
  _add(method, url, handler) {
    this._handlers.push({
      method,
      url,
      handler
    });
  }

  /**
   * @param {string} url
   * @param {Router} router
   * @return {Router}
   */
  use(url, router) {
    this._innerRoutes.push({url, router});
    return this;
  }

  // todo: add other methods
  /**
   *
   * @param url
   * @param handler
   * @return {Router}
   */
  get(url, handler) {
    this._add('get', url, handler);
    return this;
  }

  /**
   *
   * @param url
   * @param handler
   * @return {Router}
   */
  post(url, handler) {
    this._add('post', url, handler);
    return this;
  }

  /**
   *
   * @param url
   * @param handler
   * @return {Router}
   */
  any(url, handler) {
    this._add('any', url, handler);
    return this;
  }

  /**
   * @return {RouteDefinition[]}
   */
  listHandlers() {
    const inner = this._innerRoutes.flatMap(it => {
      return it.router
        .listHandlers()
        .map(handler => ({...handler, url: makeUrl([it.url, handler.url])}));
    });
    return this._handlers.concat(inner);
  }
}

module.exports = Router;

/**
 * @typedef {Object} RouteDefinition
 * @property {string} method
 * @property {string} url
 * @property {function} handler
 */