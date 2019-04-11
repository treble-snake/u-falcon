const fs = require('fs');
const path = require('path');
const debug = require('../../../helpers/debug');
const {inspect} = require('util');
const Busboy = require('busboy');

// todo: WiP
// todo: config - save only filenames from the list (and throw on text fields)
class MultipartHandler {

  /**
   * @param {Object} headers
   * @param {Readable} reader
   */
  constructor(headers, reader) {
    this._reader = reader;
    this._headers = headers;
  }

  /**
   * @param {function} resolve
   * @return {Writable}
   * @private
   */
  _createBusboy(resolve) {
    // todo: handle arrays?
    const busboy = new Busboy({headers: this._headers});
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
      resolve(body);
    });

    return busboy;
  }

  /**
   * @return {Promise<Object>} promise with parsed body
   */
  parse() {
    return new Promise((resolve, reject) => {
      try {
        const busboy = this._createBusboy(resolve);
        this._reader.pipe(busboy);
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = MultipartHandler;