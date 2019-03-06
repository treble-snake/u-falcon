const NO_DATA = Symbol('NoData');

class FalconAnswer {
  constructor() {
    this._answered = false;
    this._code = 200;
    this._data = NO_DATA;
  }

  /**
   * @return {boolean}
   */
  hasAnswer() {
    return this._answered;
  }

  /**
   * @return {{code: *, data: *}}
   * @throws if there is no answer (use hasAnswer() to check)
   */
  getAnswer() {
    if(!this.hasAnswer()) {
      throw new Error('No answer');
    }

    const result = {code: this._code};
    if(this._data !== NO_DATA) {
      result.data = this._data;
    }

    return Object.freeze(result);
  }

  /**
   * @param {Number} status
   * @param {*} [data]
   * @private
   */
  _addAnswer(status, data) {
    if (this._answered) {
      throw new Error('Already answered');
    }

    this._answered = true;
    this._code = status;
    if (data !== undefined) {
      this._data = data;
    }
  }

  /**
   * @param {Number} code
   * @param {Error|Array} errorData
   * @private
   */
  _addError(code, errorData) {
    // let data;
    // // todo: sort out
    // if (errorData !== undefined) {
    //   data = errorData instanceof Error ? errorData :
    //     {
    //       errors: !Array.isArray(errorData) ? [errorData] : errorData
    //     };
    // }
    this._addAnswer(code, errorData);
  }

  ok(data) {
    this._addAnswer(200, data);
  }

  created(data) {
    this._addAnswer(201, data);
  }

  noContent() {
    this._addAnswer(204);
  }

  badRequest(data) {
    this._addError(400, data);
  }

  notAuthorized(data) {
    this._addError(401, data);
  }

  forbidden(data) {
    this._addError(403, data);
  }

  notFound(data) {
    this._addError(404, data);
  }

  /**
   * @param {Error|*} data
   */
  internal(data) {
    // todo: think of handy way of logging this
    this._addError(500, data);
  }
}

module.exports = FalconAnswer;