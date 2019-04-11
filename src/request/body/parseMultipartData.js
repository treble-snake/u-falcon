const MultipartHandler = require('./multipart/MultipartHandler');
const ChunkReader = require('./multipart/ChunkReader');

/**
 * @param uRes
 * @param headers
 * @return {Promise<Object>}
 */
const parseMultipartData = (uRes, headers) => {
  const reader = new ChunkReader(uRes);
  return new MultipartHandler(headers, reader).parse();
};

module.exports = parseMultipartData;