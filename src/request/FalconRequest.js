const BodyParsingError = require('../errors/BodyParsingError');
const parseJson = require('./body/parseJson');
const parseFormUrlencoded = require('./body/parseFormUrlencoded');
const parseQuery = require('./parseQuery');

/**
 * @type {Map<string, any>}
 */
const BODY_PARSERS = new Map([
  ['application/json', parseJson],
  ['application/x-www-form-urlencoded', parseFormUrlencoded]
  // ['multipart/form-data', Function()] // todo: figure out
]);

class FalconRequest {
  /**
   * @param {HttpRequest} uReq
   * @param {HttpResponse} uRes
   */
  constructor(uReq, uRes) {
    /** @private */ this._uReq = uReq;
    /** @private */ this._uRes = uRes;

    this._url = uReq.getUrl();
    this._method = uReq.getMethod();
    this._query = {};
    this._body = {};
    this._headers = {};
  }

  /**
   * @return {FalconRequest}
   */
  parseQuery() {
    this._query = Object.freeze(parseQuery(this._uReq.getQuery()));
    return this;
  }

  /**
   * @return {FalconRequest}
   */
  saveHeaders() {
    this._uReq.forEach((name, value) => {
      this._headers[name] = value;
    });
    this._headers = Object.freeze(this._headers);
    return this;
  }

  async parseBody() {
    const type = this._uReq.getHeader('content-type');
    if (!type) {
      return;
    }

    if (!BODY_PARSERS.has(type)) {
      throw new BodyParsingError(`Content-type ${type} is not supported`);
    }

    const parser = BODY_PARSERS.get(type);

    try {
      // todo: handle null (and primitive?) json body
      this._body = await parser(this._uRes);
    } catch (e) {
      throw new BodyParsingError(e.message);
    }
  }

  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }

  get method() {
    return this._method;
  }

  get url() {
    return this._url;
  }

  get query() {
    return this._query;
  }

  get body() {
    return this._body;
  }
}

module.exports = FalconRequest;