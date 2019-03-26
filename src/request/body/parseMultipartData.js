const MultipartHandler = require('./multipart/MultipartHandler');
const ChunkReader = require('./multipart/ChunkReader');

/**
 * @param uRes
 * @param headers
 * @return {Promise<Object>}
 */
const parseMultipartData = (uRes, headers) => {
  // todo: WiP
  return new Promise((resolve, reject) => {
    try {
      const reader = new ChunkReader(uRes);
      new MultipartHandler(headers, reader, resolve).parse();
    }  catch (e) {
      reject(e);
    }
  });
};

module.exports = parseMultipartData;