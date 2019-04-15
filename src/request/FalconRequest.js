const BodyParsingError = require('../errors/BodyParsingError');
const parseQuery = require('./parseQuery');
const debug = require('../helpers/debug');
const getBodyParser = require('./body/getBodyParser');

class FalconRequest {
  /**
   * @param {HttpRequest} uReq
   * @param {HttpResponse} uRes
   * @param {Readonly<Object>} options
   */
  constructor(uReq, uRes, options) {
    /** @private */ this._uReq = uReq;
    /** @private */ this._uRes = uRes;
    /** @private */ this._options = options;

    /** @private */ this._url = uReq.getUrl();
    /** @private */ this._method = uReq.getMethod();
    /** @private */ this._query = {};
    /** @private */ this._body = {};
    /** @private */ this._headers = {};
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
    debug('Parsing content of type %s', type);
    // todo: configure file uploading (parsers in general?)
    const parser = getBodyParser(type);

    try {
      // todo: handle null (and primitive?) json body
      this._body = await parser(this._uRes, this._headers, this._options);
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