const MultipartHandler = require('./multipart/MultipartHandler');
const ChunkReader = require('./multipart/ChunkReader');

/**
 * @param uRes
 * @param headers
 * @param options
 * @return {Promise<Object>}
 */
const parseMultipartData = (uRes, headers, options) => {
  const reader = new ChunkReader(uRes);
  return new MultipartHandler(headers, reader, options).parse();
};

module.exports = parseMultipartData;