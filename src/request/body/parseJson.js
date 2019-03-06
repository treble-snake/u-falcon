const bodyToString = require('./bodyToString');

/**
 * @param uRes
 * @return {Promise<Object>}
 */
const parseJson = (uRes) => {
  return bodyToString(uRes)
    .then(JSON.parse);
};

module.exports = parseJson;