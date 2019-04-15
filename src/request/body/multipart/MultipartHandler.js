const os = require('os');
const fs = require('fs');
const path = require('path');
const {inspect} = require('util');
const Busboy = require('busboy');

// todo: config - save only filenames from the list (and throw on text fields)
// todo: config - custom name generator
class MultipartHandler {

  /**
   * @param {Object} headers
   * @param {Readable} reader
   * @param options
   */
  constructor(headers, reader, options) {
    this._reader = reader;
    this._headers = headers;
    this._uploadDir = options.uploadDir || os.tmpdir();

    // todo: tests indicate that small files are not closed in time
    this._filePromises = [];
  }

  /**
   * @param {function} resolve
   * @param {function} reject
   * @return {Writable}
   * @private
   */
  _createBusboy(resolve, reject) {
    // todo: handle arrays?
    const busboy = new Busboy({headers: this._headers});
    const body = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      // todo: better default name generator
      const tmpPath = path.join(this._uploadDir,
        [fieldname, Date.now(), Math.ceil(Math.random() * 1000), filename].join('-'));
      body[fieldname] = {filename, mimetype, path: tmpPath};
      const writeStream = fs.createWriteStream(tmpPath);
      file.pipe(writeStream);

      this._filePromises.push(new Promise(resolve => {
        writeStream.on('close', resolve);
      }));
    });

    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      body[fieldname] = val;
    });

    busboy.on('finish', () => {
      console.log('Done parsing form!');
      if (this._filePromises.length === 0) {
        return resolve(body);
      }

      Promise.all(this._filePromises)
        .then(() => resolve(body))
        .catch(reject);
    });

    return busboy;
  }

  /**
   * @return {Promise<Object>} promise with parsed body
   */
  parse() {
    return new Promise((resolve, reject) => {
      try {
        const busboy = this._createBusboy(resolve, reject);
        this._reader.pipe(busboy);
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = MultipartHandler;