const uws = require('uWebSockets.js');
const FalconResponse = require('./response/FalconResponse');
const FalconRequest = require('./request/FalconRequest');
const debug = require('./helpers/debug');

const BodyParsingError = require('./errors/BodyParsingError');
const errors = require('./errors/ErrorHandlers');
const RoutesConfig = require('./routing/RoutesConfig');

class Falcon {
  /**
   * todo: options type
   * @param options
   */
  constructor(options = {}) {
    debug('Creating an app with options %j', options);

    /** @private */ this._app = uws.App(options);
    /** @private */ this._socket = null;

    /** @private */ this._routesConfig = new RoutesConfig();
    /** @private */ this._html = false;
    /** @private */ this._port = null;

    /** @private */ this._errorHandlers = {
      notFound: errors.notFoundHandler,
      invalidBody: errors.invalidBodyHandler,
      internal: errors.internalErrorHandler
    };

    /** @private */ this._isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * @param {HttpResponse} uResponse
   * @param {FalconResponse} falconResponse
   * @private
   */
  _sendResponse(uResponse, falconResponse) {
    if (uResponse.aborted) {
      return;
    }

    const {code, data: body} = falconResponse.answer.getAnswer();
    const headers = falconResponse.listHeaders();

    uResponse.writeStatus(String(code));
    headers.forEach(([name, value]) => uResponse.writeHeader(name, value));

    const stringResult = typeof body === 'string';
    const result = stringResult ? body : JSON.stringify(body);

    // if it has it's already been written
    if (falconResponse.hasContentType() || body === '') {
      return uResponse.end(result);
    }

    const type = stringResult ?
      (this._html ? 'text/html' : 'text/plain') :
      'application/json';

    uResponse.writeHeader('content-type', type);
    uResponse.end(result);
  }

  /**
   * @private
   */
  _initMiddleware() {
    this._routesConfig.listRoutes().forEach((route) => {
      const {url, method, handlers} = route;
      debug(`Setting up route ${method} ${url}`);

      /**
       * @type {HttpRequest}
       */
      this._app[method](url, async (uRes, uReq) => { // todo dig further into async/await vs .than chain
        uRes.onAborted(() => {
          debug('Request was aborted');
          uRes.aborted = true;
        });

        const response = new FalconResponse();
        const request = new FalconRequest(uReq, uRes);

        try {
          request.saveHeaders().parseQuery(); // todo: this methods shouldn't be public for user

          // todo:  'head', 'delete', 'connect' ?
          if (!['get', 'trace'].includes(request.method)) {
            await request.parseBody();
          }

          for (const fn of handlers) {
            await fn(response, request);
            // stop applying middleware once we've got the answer
            if (response.answer.hasAnswer()) {
              break;
            }
          }

          if (!response.answer.hasAnswer()) {
            return this._errorHandlers.internal(
              new Error('No answer provided'), response, request, this._isProduction);
          }

        } catch (e) {
          e instanceof BodyParsingError ?
            this._errorHandlers.invalidBody(response, request) :
            this._errorHandlers.internal(e, response, request, this._isProduction);

        } finally {
          this._sendResponse(uRes, response);
        }
      });
    });
  }

  /**
   * @private
   */
  _initNotFound() {
    this._app.any('*', (uRes, uReq) => {
      const response = new FalconResponse();
      const request = new FalconRequest(uReq, uRes);

      this._errorHandlers.notFound(response, request);

      this._sendResponse(uRes, response);
    });
  }

  /**
   * @protected
   * @param port
   * @return {Promise}
   */
  _listen(port) {
    if (!port) {
      // todo: add more checks
      return Promise.reject('Invalid port');
    }

    return new Promise((resolve, reject) => {
      this._app.listen(port, (token) => {
        if (token) {
          this._socket = token;
          return resolve();
        }

        reject(new Error('Server startup failed'));
      });
    });
  }

  /**
   * @param {function|string} functionOrUrl
   * @param {Router} [router] ignored if 1st argument is a function
   * @return {Falcon}
   */
  use(functionOrUrl, router) {
    this._routesConfig.add(functionOrUrl, router);
    return this;
  }

  /**
   * todo: is this needed ?
   * @return {Falcon}
   */
  html() {
    this._html = true;
    return this;
  }

  /**
   * @param {number|string} port
   * @return {Falcon}
   */
  port(port) {
    this._port = port;
    return this;
  }

  /**
   * @param {Object} handlers
   * @param {function(res: FalconResponse, req: FalconRequest)} [handlers.notFound]
   * @param {function(res: FalconResponse, req: FalconRequest)} [handlers.invalidBody]
   * @param {function(e: (string|Error), res: FalconResponse, req: FalconRequest, isProduction: boolean)} [handlers.internal]
   * @return {Falcon}
   */
  errorHandlers(handlers) {
    if (handlers.notFound) {
      this._errorHandlers.notFound = handlers.notFound;
    }

    if (handlers.invalidBody) {
      this._errorHandlers.invalidBody = handlers.invalidBody;
    }

    if (handlers.internal) {
      this._errorHandlers.internal = handlers.internal;
    }

    return this;
  }


  /**
   * @param {number|string} [port]
   * @return {Promise}
   */
  listen(port) {
    this._initMiddleware();
    this._initNotFound();
    return this._listen(port || this._port);
  }

  /**
   * Turns the server off
   */
  close() {
    if (this._socket) {
      uws.us_listen_socket_close(this._socket);
      this._socket = null;
    }
  }
}

module.exports = Falcon;