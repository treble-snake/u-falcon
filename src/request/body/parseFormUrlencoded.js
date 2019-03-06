const bodyToString = require('./bodyToString');
const parseQuery = require('../parseQuery');

/**
 * @param uRes
 * @return {Promise<Object>}
 */
const parseJson = (uRes) => {
  return bodyToString(uRes)
    .then(parseQuery);
};

module.exports = parseJson;