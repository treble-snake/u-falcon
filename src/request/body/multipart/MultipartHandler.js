const fs = require('fs');
const path = require('path');
const debug = require('../../../helpers/debug');
const {inspect} = require('util');
const Busboy = require('busboy');

// todo: WiP
class MultipartHandler {

  /**
   * @param {Object} headers
   * @param {Readable} reader
   * @param {function} resolve
   */
  constructor(headers, reader, resolve) {
    this._onFinished = resolve;
    this._parser = this._createBusboy(headers);
    this._reader = reader;
  }

  /**
   * @param {Object} headers
   * @return {Object}
   * @private
   */
  _createBusboy(headers) {
    const busboy = new Busboy({headers});
    const body = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      body[fieldname] = 'File:' + filename;

      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', data => {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      file.on('end', () => {
        console.log('File [' + fieldname + '] Finished');
      });
    });

    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      body[fieldname] = val;
    });

    busboy.on('finish', () => {
      console.log('Done parsing form!');
      this._onFinished(body);
    });

    return busboy;
  }

  parse() {
    this._reader.pipe(this._parser);
  }
}

module.exports = MultipartHandler;