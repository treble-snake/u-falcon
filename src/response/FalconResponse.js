const FalconAnswer = require('./FalconAnswer');

const invalidHeader = str => !str || !(typeof str === 'string');

class FalconResponse {
  constructor() {
    this._answer = new FalconAnswer();
    this._cargo = {};

    this._headers = new Map();
  }

  /**
   * @return {FalconAnswer}
   */
  get answer() {
    return this._answer;
  }

  /**
   * @return {Object}
   */
  get cargo() {
    return this._cargo;
  }

  /**
   * @param {string} name
   * @param {string} value
   * @return {FalconResponse}
   * @throws Error
   */
  addHeader(name, value) {
    if (invalidHeader(name) || invalidHeader(value)) {
      throw new Error('Invalid header');
    }

    this._headers.set(name, value);
    return this;
  }

  /**
   * todo: just listHeaders ?
   * @param {function(name: string, value: string)} callback
   */
  withHeaders(callback) {
    this._headers.forEach((value, name) => callback(name, value));
  }

  /**
   * @return {[string, string][]}
   */
  listHeaders() {
    // return Array.from(this._headers.keys()).map(name => [name, this._headers[name]]);
    return Array.from(this._headers.entries());
  }

  /**
   * @return {boolean}
   */
  hasContentType() {
    return this._headers.has('content-type');
  }
}

module.exports = FalconResponse;