const {Readable} = require('stream');

class ChunkReader extends Readable {

  /**
   * @param {HttpResponse} uRes
   */
  constructor(uRes) {
    super(); // todo: options?

    /**
     * @type {HttpResponse}
     * @private
     */
    this._uRes = uRes;
  }

  /**
   * @param {number} [size]
   * @protected
   */
  _read(size) {   // eslint-disable-line
    this._uRes.onData((arrayBuffer, isLast) => {
      // todo: use push result, watch for drain ?
      this.push(Buffer.from(arrayBuffer));

      if (isLast) {
        this.push(null);
      }
    });
  }
}

module.exports = ChunkReader;